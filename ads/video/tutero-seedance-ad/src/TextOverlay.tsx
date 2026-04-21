import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { fontStacks, tutoringPalette } from "./theme";

type TextOverlayProps = {
  text: string[];
  startFrame: number;
  endFrame: number;
  fontSize: number;
  yPosition: number;
  xOffset?: number;
  shake?: boolean;
  checkmark?: boolean;
};

export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  startFrame,
  endFrame,
  fontSize,
  yPosition,
  xOffset = 0,
  shake = false,
  checkmark = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  // ── Entry: punchy spring scale 0.6 → 1.0 ─────────────────────────────
  const entrySpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  const entryScale = interpolate(entrySpring, [0, 1], [0.6, 1]);
  const entryOpacity = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ── Entry: slight Y bounce (drops in from above) ─────────────────────
  const entryY = interpolate(entrySpring, [0, 1], [-30, 0]);

  // ── Exit: fade + scale-down over last 6 frames ───────────────────────
  const exitOpacity = interpolate(
    localFrame,
    [duration - 6, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitScale = interpolate(
    localFrame,
    [duration - 6, duration],
    [1, 0.92],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = entryScale * exitScale;
  const opacity = entryOpacity * exitOpacity;

  // ── STUCK. shake — starts strong, decays ──────────────────────────────
  const shakeDecay = shake
    ? Math.exp(-localFrame * 0.04)
    : 0;
  const shakeX = shake
    ? Math.sin(localFrame * 2.5) * 4 * shakeDecay
    : 0;
  const shakeRotate = shake
    ? Math.sin(localFrame * 2.5 + 0.5) * 0.8 * shakeDecay
    : 0;

  // ── GOT IT. checkmark ─────────────────────────────────────────────────
  const checkSpring = checkmark
    ? spring({
        frame: localFrame,
        fps,
        config: { damping: 8, stiffness: 220 },
        durationInFrames: 12,
      })
    : 0;

  // Stagger: checkmark appears 3 frames before text
  const textDelay = checkmark ? Math.max(0, localFrame - 3) : localFrame;
  const textEntrySpring = checkmark
    ? spring({
        frame: textDelay,
        fps,
        config: { damping: 12, stiffness: 180 },
      })
    : entrySpring;
  const textEntryScale = checkmark
    ? interpolate(textEntrySpring, [0, 1], [0.6, 1])
    : entryScale;

  const textStyle: React.CSSProperties = {
    color: tutoringPalette.white,
    fontSize,
    fontWeight: 900,
    fontFamily: fontStacks.display,
    textTransform: "uppercase",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    textAlign: "center",
    WebkitTextStroke: "2px #000",
    paintOrder: "stroke" as const,
    textShadow:
      "0 4px 0 rgba(0,0,0,0.25), 0 0 20px rgba(0,0,0,0.3)",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: `${yPosition}%`,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: [
          `scale(${scale})`,
          `translateX(${xOffset + shakeX}px)`,
          `translateY(${entryY}px)`,
          `rotate(${shakeRotate}deg)`,
        ].join(" "),
        opacity,
      }}
    >
      {/* Checkmark for GOT IT. — lands first */}
      {checkmark && (
        <div
          style={{
            color: tutoringPalette.blue500,
            fontSize: fontSize * 1.3,
            fontWeight: 900,
            fontFamily: fontStacks.display,
            transform: `scale(${interpolate(
              checkSpring,
              [0, 1],
              [0.2, 1]
            )}) rotate(${interpolate(checkSpring, [0, 1], [-20, 0])}deg)`,
            opacity: interpolate(checkSpring, [0, 1], [0, 1]),
            marginBottom: -10,
            WebkitTextStroke: "3px #000",
            paintOrder: "stroke" as const,
            textShadow:
              "0 4px 0 rgba(0,0,0,0.25), 0 0 30px rgba(0,163,255,0.5)",
            filter: `drop-shadow(0 0 ${interpolate(
              checkSpring,
              [0, 1],
              [20, 8]
            )}px rgba(0,163,255,0.6))`,
          }}
        >
          ✓
        </div>
      )}

      {/* Text lines — staggered entry per line */}
      {text.map((line, i) => {
        const lineDelay = checkmark ? textDelay : Math.max(0, localFrame - i * 3);
        const lineSpring = spring({
          frame: lineDelay,
          fps,
          config: { damping: 12, stiffness: 180 },
        });
        const lineScale = interpolate(lineSpring, [0, 1], [0.6, 1]);
        const lineOpacity = interpolate(lineDelay, [0, 6], [0, 1], {
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              ...textStyle,
              transform: checkmark
                ? `scale(${textEntryScale})`
                : `scale(${lineScale})`,
              opacity: checkmark ? interpolate(textEntrySpring, [0, 1], [0, 1]) : lineOpacity,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};
