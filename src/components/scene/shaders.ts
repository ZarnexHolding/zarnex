import { TUNING } from "./tuning";

/**
 * The scene's only shader pair.
 *
 * Position is a two-stage mix across three baked buffers, driven by a single
 * `uPhase` uniform in [0,2]:
 *   0 -> DUST      1 -> MARK (the Z)      2 -> NODES (one per company)
 *
 * Everything else — pointer repulsion, idle drift, the R&D pulse — is added on
 * top per-vertex. No CPU work per frame.
 */

export const VERT = /* glsl */ `
  precision highp float;

  // Supplied by renderer.ts. (Three.js used to inject these; raw WebGL does not.)
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  attribute vec3 aDust;
  attribute vec3 aMark;
  attribute vec3 aNode;
  attribute vec3 aColor;
  attribute float aSeed;

  uniform float uPhase;
  uniform float uTime;
  uniform vec2  uPointer;
  uniform float uPointerForce;
  uniform float uPulse;
  uniform float uSize;
  uniform float uScale;

  varying vec3  vColor;
  varying float vGlow;

  const vec3 GOLD_CORE = vec3(0.573, 0.278, 0.024);   // #C9922F, linearised
  const vec3 GOLD_SPEC = vec3(1.000, 0.879, 0.617);   // #FFF3D0, linearised

  // expo.out — matches --ease-out so the scene and the DOM feel like one system
  float easeOut(float t) {
    return t >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
  }

  void main() {
    float t1 = easeOut(clamp(uPhase, 0.0, 1.0));
    float t2 = easeOut(clamp(uPhase - 1.0, 0.0, 1.0));

    /*
      A second, decorrelated value from the same seed. Slicing aSeed directly
      would tie a particle's role to its drift phase, and the roles would all
      move in step.
    */
    float s2 = fract(aSeed * 71.3);

    /*
      Not every particle joins the letterform. A share of them hold a slowly
      rotating cloud around it instead, so the space beside the mark is alive
      rather than dead black.
    */
    float isAtmos = step(${(1 - TUNING.atmosphereShare).toFixed(3)}, s2);

    vec3 cloud = aDust * ${TUNING.atmosphereSpread.toFixed(3)};
    float ang = uTime * ${TUNING.atmosphereSwirl.toFixed(3)} * (0.6 + 0.8 * s2);
    float ca = cos(ang);
    float sa = sin(ang);
    cloud.xy = mat2(ca, sa, -sa, ca) * cloud.xy;

    vec3 held = mix(aMark, cloud, isAtmos);
    vec3 pos = mix(mix(aDust, held, t1), aNode, t2);

    /*
      Idle life.

      Two frequencies per axis, seeded per particle, so the field never reads
      as one uniform wobble — which is exactly how it looked when each particle
      followed a single sine at 3px of travel.
    */
    float w = aSeed * 6.2831853;
    vec3 drift = vec3(
      sin(uTime * 0.42 + w)            + 0.5 * sin(uTime * 1.13 + w * 2.7),
      cos(uTime * 0.37 + w * 1.7)      + 0.5 * cos(uTime * 0.97 + w * 3.1),
      sin(uTime * 0.29 + w * 2.3)      + 0.5 * sin(uTime * 0.83 + w * 1.9)
    );

    float amp = mix(${TUNING.driftDust.toFixed(3)}, ${TUNING.driftMark.toFixed(3)}, t1);
    // The cloud is free to wander further than the letterform can afford to.
    amp = mix(amp, amp * 2.4, isAtmos * t1);

    // Embers: a few particles wander further and come back, like sparks.
    float ember = step(${(1 - TUNING.emberShare).toFixed(3)}, aSeed);
    amp += ember * 0.075 * (0.5 + 0.5 * sin(uTime * 0.5 + w)) * t1;

    pos += drift * amp;

    /*
      A ripple travelling diagonally across the letterform. Mostly in depth, a
      little vertically — displacing sideways would shear the Z out of shape.
      The mark only; the cloud already has its own swirl.
    */
    float wavePhase = (pos.x + pos.y * 0.6) * ${TUNING.waveScale.toFixed(2)}
      - uTime * ${TUNING.waveSpeed.toFixed(2)};
    float wave = sin(wavePhase) * ${TUNING.waveAmount.toFixed(3)} * t1
      * (1.0 - isAtmos);
    pos.z += wave;
    pos.y += wave * 0.35;

    // A slow swell, felt more than seen. Only while the mark is held.
    pos *= 1.0 + ${TUNING.breathe.toFixed(3)} * sin(uTime * 0.55) * t1;

    // Pointer repulsion. A holding company is a thing that exerts pull —
    // here the visitor gets to exert it back.
    // Tight falloff (~0.6 world units, roughly a 120px radius) so the effect
    // reads as happening under the cursor rather than as a vague area glow.
    vec2 away = pos.xy - uPointer;
    float d2 = dot(away, away);
    pos.xy += normalize(away + 1e-5) * uPointerForce * exp(-d2 * ${TUNING.hoverFalloff.toFixed(1)});

    // R&D pulse: a ring travelling outward from the barycentre.
    float ring = 0.0;
    if (uPulse > 0.0) {
      float r = length(pos.xy);
      ring = 1.0 - smoothstep(0.0, 0.22, abs(r - uPulse * 2.4));
      ring *= smoothstep(1.0, 0.86, uPulse);
    }

    // Gold while it is the mark; the company's own accent once it separates.
    vec3 gold = mix(GOLD_CORE, GOLD_SPEC, aSeed * 0.85);
    vColor = mix(mix(gold * 0.55, gold, t1), aColor, t2);

    /*
      Twinkle. This is the thing that actually reads as alive — gold dust
      catching the light rather than a frozen render. Seeded per particle at a
      high multiplier so neighbours are never in phase with each other.
    */
    float twinkle = 1.0 - ${TUNING.twinkle.toFixed(2)}
      * (0.5 + 0.5 * sin(uTime * ${TUNING.twinkleSpeed.toFixed(2)} + aSeed * 53.0));

    // A few of the cloud read as distinct bright motes rather than dust —
    // the lights drifting around the mark.
    float mote = step(${(1 - TUNING.moteShare).toFixed(3)}, fract(s2 * 37.1));
    float cloudGlow = mix(1.0, 0.38 + mote * 1.9, isAtmos * t1);

    /*
      Thin the cloud on the side the headline sits on. Judged on the swirled
      position, so particles dim as they orbit into the type and lift again as
      they leave — the type keeps its contrast without the field looking cut.
    */
    float typeSide = smoothstep(
      -${TUNING.typeSideFade.toFixed(2)},
      -${(TUNING.typeSideFade * 0.25).toFixed(2)},
      pos.x
    );
    cloudGlow *= mix(1.0, typeSide, isAtmos * t1);

    // Node clusters are far denser than the mark, so additive stacking would
    // blow every core to white. Damp the glow as the accents take over.
    vGlow = (0.45 + 0.85 * t1) * mix(1.0, 0.34, t2) * twinkle * cloudGlow
      + ring * 1.3;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // uSize is tuned so a particle is ~3 CSS px at the resting camera
    // distance; uScale carries device pixel ratio and viewport width.
    // Size shimmers with the twinkle too — brightness alone reads flat.
    // Cloud particles are larger and softer, so they read as depth of field
    // rather than as a second, competing letterform.
    float sizeMul = mix(1.0, 1.7 + mote * 1.5, isAtmos * t1);
    gl_PointSize = clamp(
      uSize * uScale * (1.0 + ring * 1.2) * (0.82 + 0.30 * twinkle) * sizeMul
        / -mv.z,
      1.0,
      18.0
    );
  }
`;

export const FRAG = /* glsl */ `
  precision mediump float;

  varying vec3  vColor;
  varying float vGlow;

  void main() {
    // Soft round sprite — cheaper and sharper than a texture lookup.
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    if (d > 0.25) discard;

    // Additive blending over 24k sprites saturates fast — keep each one faint
    // and let density, not opacity, build the form.
    float alpha = smoothstep(0.25, 0.0, d);
    gl_FragColor = vec4(vColor * vGlow, alpha * 0.7);
  }
`;
