import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { TikTokText } from "./TikTokText";
import { tutoringPalette } from "./theme";

// ── Timeline (30fps, 15s = 450 frames) ──────────────────────────────────────
//
// SHOT 1 — 0.0s to 4.0s   (frames 0–120)
//   Boy writing in notebook, glancing at laptop. Calm, focused.
//
// SHOT 2 — 4.0s to 8.0s   (frames 120–240)
//   Over-shoulder. Pen tapping, slight concern. "Hmm" face.
//
// SHOT 3 — 8.0s to 11.0s  (frames 240–330)
//   Front medium. Leans in, mouths a word. Something clicking.
//
// SHOT 4 — 11.0s to 15.0s (frames 330–450)
//   Close-up face. Eyes widen, nods, proud grin, tiny fist pump.
//
// VOICEOVER (embedded in Seedance video):
//   "Seeing your child finally understand — it's one of the best feelings.
//    He meets James every Tuesday after school. They work through his
//    homework together, and school feels less intimidating now.
//    And it's one-on-one the whole time."
//
// VO Timing:
//   0.5s  → VO starts
//   4.0s  → "one of the best feelings" finishes (cut to Shot 2)
//   7.0s  → "every Tuesday after school" finishes
//  10.0s  → "together" lands (Shot 3, something clicks)
//  12.0s  → "less intimidating now" finishes (cut to Shot 4)
//  14.0s  → "whole" in "one-on-one the whole time" (held smile)
//  15.0s  → "time" — video ends
//
// TikTok Text Overlays (fun, punchy, synced to VO):
//   0.8–3.8s   (24–114)   "finally understand 🥹"
//   4.2–7.2s   (126–216)  "every Tuesday 📚"
//   7.5–10.5s  (225–315)  "homework together 🤝"
//  10.8–14.8s  (324–444)  "one-on-one the WHOLE time 💪"

export const MumAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ── Base video — Seedance output with embedded VO ───────────── */}
      <Sequence from={0} durationInFrames={450}>
        <VideoWithSubtleZoom />
      </Sequence>

      {/* ── Soft flash cuts on shot transitions ──────────────────────── */}
      <Sequence from={119} durationInFrames={4}>
        <FlashCut />
      </Sequence>
      <Sequence from={239} durationInFrames={4}>
        <FlashCut />
      </Sequence>
      <Sequence from={329} durationInFrames={4}>
        <FlashCut />
      </Sequence>

      {/* ── TikTok Text 1: "finally understand" ──────────────────────── */}
      <TikTokText
        words={["finally", "understand", "🥹"]}
        startFrame={24}
        endFrame={114}
        wordDelay={4}
        fontSize={72}
        yPosition={78}
        highlightIndices={[1]}
        highlightColor={tutoringPalette.yellow}
      />

      {/* ── TikTok Text 2: "every Tuesday" ───────────────────────────── */}
      <TikTokText
        words={["every", "Tuesday", "📚"]}
        startFrame={126}
        endFrame={216}
        wordDelay={4}
        fontSize={72}
        yPosition={78}
        highlightIndices={[1]}
        highlightColor={tutoringPalette.blue200}
      />

      {/* ── TikTok Text 3: "homework together" ───────────────────────── */}
      <TikTokText
        words={["homework", "together", "🤝"]}
        startFrame={225}
        endFrame={315}
        wordDelay={4}
        fontSize={72}
        yPosition={78}
        highlightIndices={[1]}
        highlightColor={tutoringPalette.green}
      />

      {/* ── TikTok Text 4: "one-on-one the WHOLE time" ───────────────── */}
      <TikTokText
        words={["one-on-one", "the", "WHOLE", "time", "💪"]}
        startFrame={324}
        endFrame={444}
        wordDelay={4}
        fontSize={68}
        yPosition={78}
        highlightIndices={[2]}
        highlightColor={tutoringPalette.pink}
        variant="emphasis"
      />

      {/* ── Warm glow on the proud smile moment (Shot 4) ─────────────── */}
      <Sequence from={360} durationInFrames={40}>
        <ProudGlow />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Video layer with gentle Ken Burns zoom per shot ──────────────────────────
const VideoWithSubtleZoom: React.FC = () => {
  const frame = useCurrentFrame();

  // Shot boundaries
  const shot1End = 120;
  const shot2End = 240;
  const shot3End = 330;
  const shot4End = 450;

  let scale: number;
  if (frame < shot1End) {
    // Shot 1: very gentle push in
    scale = interpolate(frame, [0, shot1End], [1.0, 1.02], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
  } else if (frame < shot2End) {
    // Shot 2: hold steady (over-shoulder, no zoom)
    scale = 1.01;
  } else if (frame < shot3End) {
    // Shot 3: slight push in as realisation happens
    const local = frame - shot2End;
    scale = interpolate(local, [0, 90], [1.0, 1.03], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
  } else {
    // Shot 4: slow push in on the smile
    const local = frame - shot3End;
    scale = interpolate(local, [0, 120], [1.0, 1.04], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
  }

  return (
    <OffthreadVideo
      src={staticFile("input.mp4")}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${scale})`,
      }}
    />
  );
};

// ── Soft flash cut — barely perceptible white flash on transitions ───────────
const FlashCut: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 1, 4], [0, 0.3, 0], {
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

// ── Proud glow — very subtle warm bloom when kid smiles ─────────────────────
const ProudGlow: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 8, 30, 40], [0, 0.15, 0.15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(255,220,100,0.3) 0%, transparent 60%)",
        opacity,
      }}
    />
  );
};
