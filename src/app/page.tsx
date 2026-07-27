import { HomeScene } from "@/components/home/HomeScene";
import { Hero } from "@/components/home/Hero";
import { Statement } from "@/components/home/Statement";
import { EcosystemBeat } from "@/components/home/EcosystemBeat";
import { CompaniesPreview } from "@/components/home/CompaniesPreview";
import { SectorsScroll } from "@/components/home/SectorsScroll";
import { VisionMission } from "@/components/home/VisionMission";
import { InnovationBeat } from "@/components/home/InnovationBeat";

/**
 * Seven sections, three acts.
 *
 *   ACT I   — void   hero · statement · ecosystem      mystery, scale
 *   ACT II  — bone   companies · sectors · vision      clarity, substance
 *   ACT III — void   innovation                        the argument
 *
 * The footer closes it with the invitation, on every page.
 *
 * The WebGL scene is fixed behind the whole page and driven by scroll — see
 * HomeScene. Everything here is server-rendered; only HomeScene and
 * SectorsScroll ship JS.
 */
export default function Home() {
  return (
    <>
      <HomeScene />

      {/* ACT I — the scene is visible behind these three */}
      <Hero />
      <Statement />
      <EcosystemBeat />

      {/*
        ACT II — bone. The scene rests.

        `relative z-10` matters: the scene is a fixed, positioned element, so
        without a positioned ancestor here it would paint over these sections'
        backgrounds. It also covers the pin-spacer the sector scroll creates.
      */}
      <div id="act-two" className="ground-bone relative z-10">
        <CompaniesPreview />
        <SectorsScroll />
        <VisionMission />
      </div>

      {/* ACT III */}
      <InnovationBeat />
    </>
  );
}
