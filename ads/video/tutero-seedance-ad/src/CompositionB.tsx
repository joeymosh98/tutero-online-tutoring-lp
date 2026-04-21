import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { Caption } from "./Caption";
import { LightbulbGraphic } from "./LightbulbGraphic";
import { EndCard } from "./EndCard";
import "./load-fonts";

// ── Variant B: "The Moment It Clicks" — Bedroom Desk ────────────────────────
//
// Same VO, same timing, same end card. Different video clips:
//   - Clip 1: Bedroom desk, focus → confusion (8s)
//   - Clip 2: Bedroom desk, understanding → joy (use 5s of 8s)
//
// A/B test counterpart to Variant A (kitchen setting).
//
// Timeline (30fps, 660 frames = 22s):
//   0–8.0s     (0–240)    variant-b-clip1.mp4 (focus → confusion)
//   8.0–13.0s  (240–390)  variant-b-clip2.mp4 (breakthrough → joy)
//  13.0–22.0s  (390–660)  End card (9s hold)
//

export const TuteroVariantB: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ═══════════════════════════════════════════════════════════════════
          VIDEO LAYERS
          ═══════════════════════════════════════════════════════════════════ */}

      {/* ── PART 1: Bedroom desk — focus → confusion ───────────────────── */}
      <Sequence from={0} durationInFrames={240}>
        <BedroomClip1 />
      </Sequence>

      {/* ── PART 2: Bedroom desk — understanding → joy ─────────────────── */}
      <Sequence from={240} durationInFrames={150}>
        <BedroomClip2 />
      </Sequence>

      {/* ── PART 3: End card (shared with Variant A) ──────────────────── */}
      <Sequence from={390} durationInFrames={270}>
        <EndCard />
      </Sequence>

      {/* ═══════════════════════════════════════════════════════════════════
          VISUAL EFFECTS
          ═══════════════════════════════════════════════════════════════════ */}

      {/* Flash cuts on shot transitions */}
      <Sequence from={77} durationInFrames={4}>
        <FlashCut />
      </Sequence>
      <Sequence from={155} durationInFrames={4}>
        <FlashCut />
      </Sequence>
      <Sequence from={239} durationInFrames={4}>
        <FlashCut />
      </Sequence>

      {/* Tension vignette during "challenged and confused" */}
      <Sequence from={96} durationInFrames={75}>
        <TensionVignette />
      </Sequence>

      {/* Glow burst on "It clicks." */}
      <Sequence from={246} durationInFrames={24}>
        <GlowBurst />
      </Sequence>

      {/* Lightbulb graphic for "The light bulb goes off." */}
      <LightbulbGraphic startFrame={273} durationInFrames={54} />

      {/* ═══════════════════════════════════════════════════════════════════
          SUBTITLES — identical timing to Variant A
          ═══════════════════════════════════════════════════════════════════ */}

      <Caption
        text="This is what one of our tutoring lessons look like."
        highlights={{ tutoring: "gradient", lessons: "gradient" }}
        startFrame={3}
        endFrame={90}
        fontSize={60}
      />

      <Caption
        text="At times, our students are challenged and confused."
        highlights={{ challenged: "warm", confused: "warm" }}
        startFrame={96}
        endFrame={171}
        shake
        fontSize={60}
      />

      <Caption
        text="But then we teach them the concepts."
        highlights={{ concepts: "gradient" }}
        startFrame={183}
        endFrame={243}
        fontSize={60}
      />

      <Caption
        text="It clicks."
        highlights={{ clicks: "gradient" }}
        startFrame={246}
        endFrame={270}
        fontSize={72}
        impact
      />

      <Caption
        text="The light bulb goes off."
        highlights={{ light: "blue", bulb: "blue" }}
        startFrame={276}
        endFrame={324}
        fontSize={60}
        yPosition={55}
      />

      <Caption
        text="If you want your child to make amazing academic progress."
        highlights={{
          amazing: "gradient",
          academic: "gradient",
          progress: "gradient",
        }}
        startFrame={330}
        endFrame={390}
        fontSize={58}
      />

      <Caption
        text="Speak with our team today."
        highlights={{ team: "blue", today: "blue" }}
        startFrame={399}
        endFrame={459}
        fontSize={48}
        yPosition={82}
        onLight
      />

      <Caption
        text="There are no contracts and no upfront payments."
        highlights={{ contracts: "blue", upfront: "blue", payments: "blue" }}
        startFrame={468}
        endFrame={554}
        fontSize={44}
        yPosition={82}
        onLight
      />

      {/* ═══════════════════════════════════════════════════════════════════
          AUDIO — identical to Variant A
          ═══════════════════════════════════════════════════════════════════ */}

      <Audio
        src={staticFile("music-bg.wav")}
        volume={(f) => {
          if (f < 459) return 0.7;
          if (f >= 468 && f <= 554) return 0.7;
          return 1.0;
        }}
      />

      <Audio src={staticFile("voiceover-emma.mp3")} volume={1} />

      <Sequence from={468}>
        <Audio src={staticFile("vo-emma-contracts.mp3")} volume={1} />
      </Sequence>

      <Sequence from={3}>
        <Audio src={staticFile("sfx-whoosh.wav")} volume={0.3} />
      </Sequence>

      <Sequence from={96}>
        <Audio src={staticFile("sfx-tension.wav")} volume={0.45} />
      </Sequence>

      <Sequence from={246}>
        <Audio src={staticFile("sfx-ding.wav")} volume={0.5} />
      </Sequence>

      <Sequence from={284}>
        <Audio src={staticFile("sfx-pop.wav")} volume={0.4} />
      </Sequence>

      <Sequence from={390}>
        <Audio src={staticFile("sfx-swoosh.wav")} volume={0.3} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Bedroom clip 1: focus → confusion ────────────────────────────────────────
const BedroomClip1: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle slow push-in (Ken Burns)
  const scale = interpolate(frame, [0, 240], [1.0, 1.04], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <OffthreadVideo
      src={staticFile("variant-b-clip1.mp4")}
      muted
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${scale})`,
      }}
    />
  );
};

// ── Bedroom clip 2: understanding → joy ──────────────────────────────────────
const BedroomClip2: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 150], [1.0, 1.05], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const fadeIn = interpolate(frame, [0, 3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <OffthreadVideo
        src={staticFile("variant-b-clip2.mp4")}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Effects (shared with Variant A) ──────────────────────────────────────────

const FlashCut: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 1, 4], [0, 0.6, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ backgroundColor: "#ffffff", opacity, mixBlendMode: "screen" }}
    />
  );
};

const TensionVignette: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, 55, 75], [0, 0.45, 0.45, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        opacity,
      }}
    />
  );
};

const GlowBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 3, 24], [0, 0.4, 0], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, 24], [0.6, 1.5], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  return (
    <AbsoluteFill
      style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <div
        style={{
          width: 800,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,210,50,0.6) 0%, rgba(0,163,255,0.2) 50%, transparent 70%)",
          transform: `scale(${scale})`,
          opacity,
          filter: "blur(40px)",
        }}
      />
    </AbsoluteFill>
  );
};
