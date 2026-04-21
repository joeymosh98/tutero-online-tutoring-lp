import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { fontStacks, tutoringPalette, tutoringGradient, tutoringGradientBright } from "./theme";

// ── Types ────────────────────────────────────────────────────────────────────

type WordHighlight = "gradient" | "blue" | "warm";

type CaptionProps = {
  /** Full subtitle text — will be split into words automatically. */
  text: string;
  /** Map of lowercase words → highlight style. */
  highlights?: Record<string, WordHighlight>;
  startFrame: number;
  endFrame: number;
  /** Y position as % from top. Default 74 (lower third). */
  yPosition?: number;
  fontSize?: number;
  /** Big centered text for impact moments (e.g. "It clicks.") */
  impact?: boolean;
  /** Apply a shake to the whole block (decaying). */
  shake?: boolean;
  /** Use dark text for light backgrounds (e.g. end card). */
  onLight?: boolean;
};

export const Caption: React.FC<CaptionProps> = ({
  text,
  highlights = {},
  startFrame,
  endFrame,
  yPosition = 74,
  fontSize = 62,
  impact = false,
  shake = false,
  onLight = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  // ── Overall entry / exit ───────────────────────────────────────────────
  const entryOpacity = interpolate(localFrame, [0, 5], [0, 1], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    localFrame,
    [duration - 6, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = entryOpacity * exitOpacity;

  // ── Shake (for tension moments) ────────────────────────────────────────
  const shakeDecay = shake ? Math.exp(-localFrame * 0.06) : 0;
  const shakeX = shake ? Math.sin(localFrame * 2.8) * 5 * shakeDecay : 0;
  const shakeRotate = shake
    ? Math.sin(localFrame * 2.8 + 0.5) * 0.6 * shakeDecay
    : 0;

  // ── Split text into words ──────────────────────────────────────────────
  const words = text.split(/\s+/);

  // ── Break into visual lines (max ~5 words per line for 9:16) ───────────
  const maxWordsPerLine = impact ? 3 : 5;
  const lines: string[][] = [];
  for (let i = 0; i < words.length; i += maxWordsPerLine) {
    lines.push(words.slice(i, i + maxWordsPerLine));
  }

  let globalWordIdx = 0;

  const effectiveFontSize = impact ? fontSize * 1.6 : fontSize;

  return (
    <div
      style={{
        position: "absolute",
        top: impact ? "50%" : `${yPosition}%`,
        left: 0,
        right: 0,
        transform: impact
          ? `translateY(-50%) translateX(${shakeX}px) rotate(${shakeRotate}deg)`
          : `translateX(${shakeX}px) rotate(${shakeRotate}deg)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity,
        padding: "0 48px",
      }}
    >
      {lines.map((lineWords, lineIdx) => (
        <div
          key={lineIdx}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0 14px",
            lineHeight: 1.15,
          }}
        >
          {lineWords.map((word) => {
            const idx = globalWordIdx++;
            return (
              <AnimatedWord
                key={idx}
                word={word}
                index={idx}
                localFrame={localFrame}
                fps={fps}
                fontSize={effectiveFontSize}
                highlight={getHighlight(word, highlights)}
                onLight={onLight}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ── Single animated word ─────────────────────────────────────────────────────

const AnimatedWord: React.FC<{
  word: string;
  index: number;
  localFrame: number;
  fps: number;
  fontSize: number;
  highlight: WordHighlight | null;
  onLight?: boolean;
}> = ({ word, index, localFrame, fps, fontSize, highlight, onLight = false }) => {
  const wordDelay = index * 2; // 2-frame stagger per word
  const wordFrame = Math.max(0, localFrame - wordDelay);

  const wordSpring = spring({
    frame: wordFrame,
    fps,
    config: { damping: 14, stiffness: 220 },
  });

  const scale = interpolate(wordSpring, [0, 1], [0.7, 1]);
  const wordOpacity = interpolate(wordFrame, [0, 3], [0, 1], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(wordSpring, [0, 1], [12, 0]);

  const isGradient = highlight === "gradient";
  const isBlue = highlight === "blue";
  const isWarm = highlight === "warm";

  // On light backgrounds: dark text, standard gradient, dark blue highlights
  const textColor = onLight
    ? isBlue
      ? tutoringPalette.blue800
      : isWarm
        ? "#CC5500"
        : tutoringPalette.blue800
    : isBlue
      ? tutoringPalette.blue500
      : isWarm
        ? "#FF8C33"
        : tutoringPalette.white;

  const shadow = onLight
    ? "none"
    : isGradient
      ? "none"
      : "0 3px 0 rgba(0,0,0,0.35), 0 0 20px rgba(0,0,0,0.5)";

  const baseStyle: React.CSSProperties = {
    fontSize,
    fontWeight: 900,
    fontFamily: fontStacks.display,
    color: textColor,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    transform: `scale(${scale}) translateY(${y}px)`,
    opacity: wordOpacity,
    display: "inline-block",
    textShadow: shadow,
  };

  if (isGradient) {
    const grad = onLight ? tutoringGradient : tutoringGradientBright;
    const filter = onLight
      ? "none"
      : "drop-shadow(0 3px 0 rgba(0,0,0,0.35)) drop-shadow(0 0 20px rgba(0,0,0,0.5))";
    return (
      <span
        style={{
          ...baseStyle,
          background: grad,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter,
        }}
      >
        {word}
      </span>
    );
  }

  return <span style={baseStyle}>{word}</span>;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getHighlight(
  word: string,
  highlights: Record<string, WordHighlight>
): WordHighlight | null {
  // Strip punctuation for matching
  const clean = word.replace(/[.,!?;:'"]/g, "").toLowerCase();
  return highlights[clean] ?? null;
}
