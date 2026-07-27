import { buildBuffers } from "./geometry";
import { VERT, FRAG } from "./shaders";
import { createFpsGuard, TIER_PARTICLES, type Tier } from "./quality";
import { CAMERA_Z, FOV_DEG, HALF_HEIGHT } from "./camera";
import { TUNING } from "./tuning";

/**
 * Raw WebGL rather than Three.js — a deliberate deviation from the plan.
 *
 * The entire scene is ONE static vertex buffer drawn with ONE `drawArrays`
 * call. Three.js brought 129kB gz of scene graph, material system, loaders and
 * raycasting to serve that, which is the whole 3D budget spent on machinery we
 * never touch. This file is the ~4kB that actually does the work.
 *
 * We lose nothing: no scene graph, no lights, no loaders, no post-processing
 * were ever in the design. If a future scene needs them, reintroduce Three
 * behind the same SceneHandle interface.
 */

export type SceneHandle = {
  /** 0 = dust, 1 = the Z, 2 = the ecosystem. Lerped toward internally. */
  setPhase(phase: number): void;
  /** 0..1 — the R&D pulse travelling outward. 0 disables it. */
  setPulse(p: number): void;
  /**
   * Pointer position in normalised device coords, [-1,1] with +y up.
   * The renderer converts to model space itself — it is the only thing that
   * knows the camera and the current field offset, and computing this outside
   * is how the repulsion ended up beside the cursor instead of under it.
   */
  setPointer(ndcX: number, ndcY: number): void;
  setPointerForce(f: number): void;
  /**
   * Shifts the whole field in world units, so a beat can hold the type on one
   * side and the scene on the other. Lerped, so beat changes glide.
   */
  setOffset(x: number, y: number): void;
  /**
   * Stops the render loop entirely. Used while the scene is covered by opaque
   * content — no reason to burn GPU on pixels nobody can see.
   */
  setPaused(paused: boolean): void;
  resize(): void;
  dispose(): void;
  tier: Tier;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`[scene] shader compile failed: ${log}`);
  }
  return sh;
}

/** Column-major perspective projection, matching GLSL's mat4 layout. */
function perspective(out: Float32Array, fovDeg: number, aspect: number) {
  const near = 0.1;
  const far = 100;
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
  return out;
}

export function createScene(
  canvas: HTMLCanvasElement,
  tier: Exclude<Tier, 0>,
  onDowngrade?: () => void,
): SceneHandle {
  const gl = (canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: "high-performance",
  }) ?? canvas.getContext("webgl", { alpha: true, antialias: false, depth: false })) as
    | WebGLRenderingContext
    | null;

  if (!gl) throw new Error("[scene] no WebGL context");

  const program = gl.createProgram()!;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`[scene] link failed: ${gl.getProgramInfoLog(program)}`);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  gl.useProgram(program);

  const count = TIER_PARTICLES[tier];
  const data = buildBuffers(count);

  const buffers: WebGLBuffer[] = [];
  const bind = (name: string, src: Float32Array, size: number) => {
    const loc = gl.getAttribLocation(program, name);
    if (loc < 0) return;
    const buf = gl.createBuffer()!;
    buffers.push(buf);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, src, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  };

  bind("aDust", data.dust, 3);
  bind("aMark", data.mark, 3);
  bind("aNode", data.nodes, 3);
  bind("aColor", data.color, 3);
  bind("aSeed", data.seed, 1);

  const u = {
    proj: gl.getUniformLocation(program, "projectionMatrix"),
    mv: gl.getUniformLocation(program, "modelViewMatrix"),
    phase: gl.getUniformLocation(program, "uPhase"),
    time: gl.getUniformLocation(program, "uTime"),
    pointer: gl.getUniformLocation(program, "uPointer"),
    force: gl.getUniformLocation(program, "uPointerForce"),
    pulse: gl.getUniformLocation(program, "uPulse"),
    size: gl.getUniformLocation(program, "uSize"),
    scale: gl.getUniformLocation(program, "uScale"),
  };

  /*
    Uniform scale on the diagonal, camera on +Z looking at the origin.
    A point p lands at (SCALE * p + offset), so the pointer conversion below
    has to divide by SCALE as well as subtracting the offset.
  */
  const SCALE = TUNING.scale;
  const modelView = new Float32Array([
    SCALE, 0, 0, 0,
    0, SCALE, 0, 0,
    0, 0, SCALE, 0,
    0, 0, -CAMERA_Z, 1,
  ]);
  const projection = new Float32Array(16);
  gl.uniformMatrix4fv(u.mv, false, modelView);

  // ~3 CSS px at the resting camera distance.
  gl.uniform1f(
    u.size,
    tier === 2 ? TUNING.particleSize.full : TUNING.particleSize.reduced,
  );

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive
  gl.clearColor(0, 0, 0, 0);

  let phase = 0;
  let targetPhase = 0;
  let pulse = 0;
  let force = 0;
  let raf = 0;
  let disposed = false;
  let paused = false;
  const offset = { x: 0, y: 0, tx: 0, ty: 0 };
  // Parked far outside the field until the pointer actually moves.
  const pointer = { ndcX: 99, ndcY: 99 };
  const start = performance.now();
  const guard = createFpsGuard(() => onDowngrade?.());

  const resize = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;

    const dpr = Math.min(window.devicePixelRatio || 1, tier === 2 ? 2 : 1.5);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);

    perspective(projection, FOV_DEG, w / h);
    gl.uniformMatrix4fv(u.proj, false, projection);
    gl.uniform1f(u.scale, dpr * Math.min(1, w / 1280));
  };

  const frame = (now: number) => {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    guard(now);

    // Lerp toward the targets so a fast scroll never snaps the morph.
    phase += (targetPhase - phase) * 0.08;
    offset.x += (offset.tx - offset.x) * 0.06;
    offset.y += (offset.ty - offset.y) * 0.06;

    modelView[12] = offset.x;
    modelView[13] = offset.y;
    gl.uniformMatrix4fv(u.mv, false, modelView);

    /*
      NDC -> model space, every frame.
      The shader repels against `pos` BEFORE the model-view translate, so the
      field offset has to come back off here. Done per frame rather than on
      pointermove so it stays correct while the offset is still lerping.
    */
    const aspect = canvas.width / canvas.height;
    gl.uniform2f(
      u.pointer,
      (pointer.ndcX * HALF_HEIGHT * aspect - offset.x) / SCALE,
      (pointer.ndcY * HALF_HEIGHT - offset.y) / SCALE,
    );

    gl.uniform1f(u.time, (now - start) / 1000);
    gl.uniform1f(u.phase, phase);
    gl.uniform1f(u.pulse, pulse);
    gl.uniform1f(u.force, force);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);
  };

  resize();
  raf = requestAnimationFrame(frame);

  return {
    tier,
    setPhase: (p) => {
      targetPhase = Math.max(0, Math.min(2, p));
    },
    setPulse: (p) => {
      pulse = p;
    },
    setPointer: (ndcX, ndcY) => {
      pointer.ndcX = ndcX;
      pointer.ndcY = ndcY;
    },
    setOffset: (x, y) => {
      offset.tx = x;
      offset.ty = y;
    },
    setPointerForce: (f) => {
      force = f;
    },
    setPaused: (p) => {
      if (p === paused || disposed) return;
      paused = p;
      if (p) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        raf = requestAnimationFrame(frame);
      }
    },
    resize,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      for (const b of buffers) gl.deleteBuffer(b);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
