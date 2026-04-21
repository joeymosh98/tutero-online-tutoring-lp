import React from "react";
import { Composition } from "remotion";
import { TuteroTuesdayNight } from "./Composition";
import { TuteroTuesdayNight4x5 } from "./Composition4x5";
import { TuteroVariantB } from "./CompositionB";
import { TuteroVariantB4x5 } from "./CompositionB4x5";

// ── "The Moment It Clicks" — A/B test variants ─────────────
// Total: 22s = 660 frames
// Emma VO main: 0–15.3s | Emma VO contracts: 15.6–18.5s
//
// Variant A: Kitchen table setting (original)
// Variant B: Bedroom study desk setting

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── Variant A: Kitchen ─────────────────────────── */}
      <Composition
        id="VariantA-9x16"
        component={TuteroTuesdayNight}
        durationInFrames={660}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="VariantA-4x5"
        component={TuteroTuesdayNight4x5}
        durationInFrames={660}
        fps={30}
        width={1080}
        height={1350}
      />

      {/* ── Variant B: Bedroom Desk ────────────────────── */}
      <Composition
        id="VariantB-9x16"
        component={TuteroVariantB}
        durationInFrames={660}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="VariantB-4x5"
        component={TuteroVariantB4x5}
        durationInFrames={660}
        fps={30}
        width={1080}
        height={1350}
      />
    </>
  );
};
