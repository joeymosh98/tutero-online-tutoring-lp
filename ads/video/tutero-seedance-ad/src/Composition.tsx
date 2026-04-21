import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { Caption } from "./Caption";
import { LightbulbGraphic } from "./LightbulbGraphic";
import { EndCard } from "./EndCard";
import "./load-fonts";

// ── Timeline (30fps, 660 frames = 22s) ──────────────────────────────────────
//
// PART 1 — Seedance video (muted)
//   0.0–8.0s   (0–240)     input.mp4
//
// PART 2 — Happy learning clip (muted)
//   8.0–13.0s  (240–390)   clip-happy-learning.mp4
//
// PART 3 — End card (extended for Meta CTA)
//  13.0–22.0s  (390–660)   Branded end card — 9s hold
//
// ── Emma VO main (15.3s) plays from frame 0 ─────────────────────────────────
// ── Emma VO contracts (2.87s) plays from frame 468 (15.6s) ──────────────────
//
// ── Subtitle timing (synced to VO script) ────────────────────────────────────
//
//   0.1–3.0s   (3–90)      "This is what one of our tutoring lessons look like."
//   3.2–5.7s   (96–171)    "At times, our students are challenged and confused."
//   6.1–8.1s   (183–243)   "But then we teach them the concepts."
//   8.2–9.0s   (246–270)   "It clicks."
//   9.2–10.8s  (276–324)   "The light bulb goes off."
//  11.0–13.0s  (330–390)   "If you want your child to make amazing academic progress."
//  13.3–15.3s  (399–459)   "Speak with our team today."
//  15.6–18.5s  (468–554)   "There are no contracts and no upfront payments."
//

export const TuteroTuesdayNight: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ═══════════════════════════════════════════════════════════════════
          VIDEO LAYERS
          ═══════════════════════════════════════════════════════════════════ */}

      {/* ── PART 1: Seedance video (muted) ──────────────────────────────── */}
      <Sequence from={0} durationInFrames={240}>
        <SeedanceVideo />
      </Sequence>

      {/* ── PART 2: Happy learning clip (muted) ─────────────────────────── */}
      <Sequence from={240} durationInFrames={150}>
        <HappyLearningClip />
      </Sequence>

      {/* ── PART 3: End card (9s hold for Meta CTA) ────────────────────── */}
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

      {/* Lightbulb graphic for "The light bulb goes off." — extended for impact */}
      <LightbulbGraphic startFrame={273} durationInFrames={54} />

      {/* ═══════════════════════════════════════════════════════════════════
          SUBTITLES — synced to Emma VO script
          ═══════════════════════════════════════════════════════════════════ */}

      {/* 1: "This is what one of our tutoring lessons look like." */}
      <Caption
        text="This is what one of our tutoring lessons look like."
        highlights={{ tutoring: "gradient", lessons: "gradient" }}
        startFrame={3}
        endFrame={90}
        fontSize={60}
      />

      {/* 2: "At times, our students are challenged and confused." */}
      <Caption
        text="At times, our students are challenged and confused."
        highlights={{ challenged: "warm", confused: "warm" }}
        startFrame={96}
        endFrame={171}
        shake
        fontSize={60}
      />

      {/* 3: "But then we teach them the concepts." */}
      <Caption
        text="But then we teach them the concepts."
        highlights={{ concepts: "gradient" }}
        startFrame={183}
        endFrame={243}
        fontSize={60}
      />

      {/* 4: "It clicks." — big impact moment */}
      <Caption
        text="It clicks."
        highlights={{ clicks: "gradient" }}
        startFrame={246}
        endFrame={270}
        fontSize={72}
        impact
      />

      {/* 5: "The light bulb goes off." — with lightbulb graphic above */}
      <Caption
        text="The light bulb goes off."
        highlights={{ light: "blue", bulb: "blue" }}
        startFrame={276}
        endFrame={324}
        fontSize={60}
        yPosition={55}
      />

      {/* 6: "If you want your child to make amazing academic progress." */}
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

      {/* 7: "Speak with our team today." — over end card (light bg) */}
      <Caption
        text="Speak with our team today."
        highlights={{ team: "blue", today: "blue" }}
        startFrame={399}
        endFrame={459}
        fontSize={48}
        yPosition={82}
        onLight
      />

      {/* 8: "There are no contracts and no upfront payments." — end card (light bg) */}
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
          AUDIO
          ═══════════════════════════════════════════════════════════════════ */}

      {/* Background music — volume baked into WAV:
          ~10% during VO, builds to ~40% on end card hold.
          Duck during the contracts VO line too. */}
      <Audio
        src={staticFile("music-bg.wav")}
        volume={(f) => {
          // During main VO: keep music extra subtle
          if (f < 459) return 0.7;
          // During contracts VO line (468–554): duck again
          if (f >= 468 && f <= 554) return 0.7;
          // Silent hold after all VO: let music come through
          return 1.0;
        }}
      />

      {/* Emma VO main — plays from start */}
      <Audio src={staticFile("voiceover-emma.mp3")} volume={1} />

      {/* Emma VO contracts — plays during end card */}
      <Sequence from={468}>
        <Audio src={staticFile("vo-emma-contracts.mp3")} volume={1} />
      </Sequence>

      {/* SFX: whoosh on first subtitle */}
      <Sequence from={3}>
        <Audio src={staticFile("sfx-whoosh.wav")} volume={0.3} />
      </Sequence>

      {/* SFX: tension hit on "challenged and confused" */}
      <Sequence from={96}>
        <Audio src={staticFile("sfx-tension.wav")} volume={0.45} />
      </Sequence>

      {/* SFX: ding on "It clicks." */}
      <Sequence from={246}>
        <Audio src={staticFile("sfx-ding.wav")} volume={0.5} />
      </Sequence>

      {/* SFX: pop on lightbulb turning on */}
      <Sequence from={284}>
        <Audio src={staticFile("sfx-pop.wav")} volume={0.4} />
      </Sequence>

      {/* SFX: swoosh on end card */}
      <Sequence from={390}>
        <Audio src={staticFile("sfx-swoosh.wav")} volume={0.3} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Video layer with subtle Ken Burns zoom per shot ──────────────────────────
const SeedanceVideo: React.FC = () => {
  const frame = useCurrentFrame();

  let scale: number;
  if (frame < 78) {
    scale = interpolate(frame, [0, 78], [1.0, 1.03], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
  } else if (frame < 156) {
    const local = frame - 78;
    scale = interpolate(local, [0, 78], [1.03, 1.0], {
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    });
  } else {
    const local = frame - 156;
    scale = interpolate(local, [0, 84], [1.0, 1.06], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
  }

  return (
    <OffthreadVideo
      src={staticFile("input.mp4")}
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

// ── Happy learning clip with Ken Burns and fade-in ───────────────────────────
const HappyLearningClip: React.FC = () => {
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
        src={staticFile("clip-happy-learning.mp4")}
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

// ── Flash cut — brief white flash on shot transitions ────────────────────────
const FlashCut: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 1, 4], [0, 0.6, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        opacity,
        mixBlendMode: "screen",
      }}
    />
  );
};

// ── Tension vignette — edges darken during "challenged and confused" ─────────
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

// ── Glow burst — warm light bloom on "It clicks." ───────────────────────────
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
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
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
