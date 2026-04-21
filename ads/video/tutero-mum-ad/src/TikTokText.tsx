import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { tutoringPalette, fontStacks } from "./theme";

type TikTokTextProps = {
  /** Array of words — each word pops in sequentially */
  words: string[];
  startFrame: number;
  endFrame: number;
  /** Frames between each word appearing */
  wordDelay?: number;
  fontSize?: number;
  /** Vertical position as percentage from top */
  yPosition?: number;
  /** Accent color for highlighted words */
  highlightColor?: string;
  /** Indices of words to highlight */
  highlightIndices?: number[];
  /** Style variant */
  variant?: "default" | "emphasis" | "whisper";
};

export const TikTokText: React.FC<TikTokTextProps> = ({
  words,
  startFrame,
  endFrame,
  wordDelay = 3,
  fontSize = 64,
  yPosition = 75,
  highlightColor = tutoringPalette.yellow,
  highlightIndices = [],
  variant = "default",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  // Container fade in/out
  const containerOpacity = interpolate(
    localFrame,
    [0, 4, duration - 8, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Container scale bounce on entry
  const containerSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 200 },
  });
  const containerScale = interpolate(containerSpring, [0, 1], [0.8, 1]);

  const variantStyles = getVariantStyles(variant, fontSize);

  return (
    <div
      style={{
        position: "absolute",
        top: `${yPosition}%`,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: containerOpacity,
        transform: `scale(${containerScale})`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px 12px",
          maxWidth: "90%",
          padding: "16px 24px",
          borderRadius: 16,
          ...variantStyles.container,
        }}
      >
        {words.map((word, i) => (
          <Word
            key={i}
            word={word}
            index={i}
            localFrame={localFrame}
            wordDelay={wordDelay}
            fps={fps}
            fontSize={fontSize}
            isHighlighted={highlightIndices.includes(i)}
            highlightColor={highlightColor}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
};

type WordProps = {
  word: string;
  index: number;
  localFrame: number;
  wordDelay: number;
  fps: number;
  fontSize: number;
  isHighlighted: boolean;
  highlightColor: string;
  variant: "default" | "emphasis" | "whisper";
};

const Word: React.FC<WordProps> = ({
  word,
  index,
  localFrame,
  wordDelay,
  fps,
  fontSize,
  isHighlighted,
  highlightColor,
  variant,
}) => {
  const wordStart = index * wordDelay;
  const wordLocalFrame = localFrame - wordStart;

  if (wordLocalFrame < 0) return null;

  // Each word bounces in with a spring
  const wordSpring = spring({
    frame: wordLocalFrame,
    fps,
    config: { damping: 10, stiffness: 260, mass: 0.4 },
  });

  const scale = interpolate(wordSpring, [0, 1], [0.3, 1]);
  const opacity = interpolate(wordSpring, [0, 1], [0, 1]);
  const translateY = interpolate(wordSpring, [0, 1], [20, 0]);

  // Slight random rotation for that TikTok energy
  const rotateOffset = Math.sin(index * 1.7) * 1.5;
  const rotate = interpolate(wordSpring, [0, 1], [rotateOffset * 3, 0]);

  const variantStyles = getVariantStyles(variant, fontSize);

  return (
    <span
      style={{
        display: "inline-block",
        transform: `scale(${scale}) translateY(${translateY}px) rotate(${rotate}deg)`,
        opacity,
        color: isHighlighted ? highlightColor : tutoringPalette.white,
        fontSize: isHighlighted ? fontSize * 1.15 : fontSize,
        fontWeight: 900,
        fontFamily: fontStacks.tiktok,
        WebkitTextStroke: isHighlighted ? "2.5px #000" : "2px #000",
        paintOrder: "stroke" as const,
        textShadow: isHighlighted
          ? `0 0 20px ${highlightColor}80, 0 4px 0 rgba(0,0,0,0.3)`
          : "0 4px 0 rgba(0,0,0,0.25), 0 0 12px rgba(0,0,0,0.3)",
        ...variantStyles.word,
      }}
    >
      {word}
    </span>
  );
};

function getVariantStyles(
  variant: "default" | "emphasis" | "whisper",
  fontSize: number
) {
  switch (variant) {
    case "emphasis":
      return {
        container: {
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(8px)",
        },
        word: {
          fontSize: fontSize * 1.1,
          letterSpacing: "-0.02em",
        },
      };
    case "whisper":
      return {
        container: {},
        word: {
          fontSize: fontSize * 0.9,
          fontWeight: 600 as const,
          WebkitTextStroke: "1.5px #000",
        },
      };
    default:
      return {
        container: {},
        word: {},
      };
  }
}
