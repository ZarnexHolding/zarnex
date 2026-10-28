import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    The group site carries no company profiles (owner decision, 2026-10-28):
    a company card opens the company's own website. Old profile links land on
    the index rather than a 404. Temporary on purpose — profiles may return,
    and a permanent redirect is cached by browsers indefinitely.
  */
  redirects() {
    return [{ source: "/companies/:slug", destination: "/companies", permanent: false }];
  },
};

export default nextConfig;
