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

// ── Variant B — 4:5 (1080×1350) ─────────────────────────────────────────────
//
// Same as CompositionB.tsx but with adjusted caption positions for 4:5 canvas.
// EndCard auto-adapts via useVideoConfig().

export const TuteroVariantB4x5: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* VIDEO LAYERS */}
      <Sequence from={0} durationInFrames={240}>
        <BedroomClip1 />
      </Sequence>

      <Sequence from={240} durationInFrames={150}>
        <BedroomClip2 />
      </Sequence>

      <Sequence from={390} durationInFrames={270}>
        <EndCard />
      </Sequence>

      {/* VISUAL EFFECTS */}
      <Sequence from={77} durationInFrames={4}>
        <FlashCut />
      </Sequence>
      <Sequence from={155} durationInFrames={4}>
        <FlashCut />
      </Sequence>
      <Sequence from={239} durationInFrames={4}>
        <FlashCut />
      </Sequence>

      <Sequence from={96} durationInFrames={75}>
        <TensionVignette />
      </Sequence>

      <Sequence from={246} durationInFrames={24}>
        <GlowBurst />
      </Sequence>

      <LightbulbGraphic startFrame={273} durationInFrames={54} />

      {/* SUBTITLES — adjusted yPosition for 4:5 */}
      <Caption
        text="This is what one of our tutoring lessons look like."
        highlights={{ tutoring: "gradient", lessons: "gradient" }}
        startFrame={3}
        endFrame={90}
        fontSize={56}
        yPosition={68}
      />

      <Caption
        text="At times, our students are challenged and confused."
        highlights={{ challenged: "warm", confused: "warm" }}
        startFrame={96}
        endFrame={171}
        shake
        fontSize={56}
        yPosition={68}
      />

      <Caption
        text="But then we teach them the concepts."
        highlights={{ concepts: "gradient" }}
        startFrame={183}
        endFrame={243}
        fontSize={56}
        yPosition={68}
      />

      <Caption
        text="It clicks."
        highlights={{ clicks: "gradient" }}
        startFrame={246}
        endFrame={270}
        fontSize={68}
        impact
      />

      <Caption
        text="The light bulb goes off."
        highlights={{ light: "blue", bulb: "blue" }}
        startFrame={276}
        endFrame={324}
        fontSize={56}
        yPosition={52}
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
        fontSize={54}
        yPosition={68}
      />

      <Caption
        text="Speak with our team today."
        highlights={{ team: "blue", today: "blue" }}
        startFrame={399}
        endFrame={459}
        fontSize={44}
        yPosition={78}
        onLight
      />

      <Caption
        text="There are no contracts and no upfront payments."
        highlights={{ contracts: "blue", upfront: "blue", payments: "blue" }}
        startFrame={468}
        endFrame={554}
        fontSize={40}
        yPosition={78}
        onLight
      />

      {/* AUDIO — identical */}
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

// ── Video layers ─────────────────────────────────────────────────────────────

const BedroomClip1: React.FC = () => {
  const frame = useCurrentFrame();
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

// ── Effects ──────────────────────────────────────────────────────────────────

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
