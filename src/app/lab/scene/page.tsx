import type { Metadata } from "next";
import { SceneLab } from "./SceneLab";

export const metadata: Metadata = {
  title: "Scene lab",
  robots: { index: false, follow: false },
};

export default function SceneLabPage() {
  return <SceneLab />;
}
