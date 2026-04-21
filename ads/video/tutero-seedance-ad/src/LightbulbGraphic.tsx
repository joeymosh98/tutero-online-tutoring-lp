import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

/**
 * The Tutero brand lightbulb — dramatically "switches on" with a full-screen
 * golden flash, expanding glow, rotating rays, and sparkle particles.
 * Designed to be the emotional peak of the ad: "The light bulb goes off."
 */
export const LightbulbGraphic: React.FC<{
  startFrame: number;
  durationInFrames: number;
}> = ({ startFrame, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > startFrame + durationInFrames) return null;

  const local = frame - startFrame;

  // ── Phase 1: Bulb appears dim (frames 0–7) ────────────────────────────
  const entrySpring = spring({
    frame: local,
    fps,
    config: { damping: 8, stiffness: 160, mass: 0.8 },
  });
  const bulbScale = interpolate(entrySpring, [0, 1], [0.2, 1]);
  const bulbOpacity = interpolate(local, [0, 3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ── Phase 2: "SWITCH ON" flash (frames 7–12) ──────────────────────────
  const lightOn = interpolate(local, [7, 11], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Full-screen golden flash
  const flashOpacity = interpolate(local, [7, 9, 12, 16], [0, 0.7, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Phase 3: Radiant afterglow (frames 12+) ───────────────────────────
  // Expanding glow rings
  const glowScale = interpolate(local, [7, 35], [0.4, 3.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const glowOpacity = interpolate(local, [7, 12, 30, durationInFrames], [0, 0.8, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Light rays
  const rayRotation = interpolate(local, [7, durationInFrames], [0, 45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rayOpacity = interpolate(local, [7, 11, 32, durationInFrames], [0, 0.9, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rayLength = interpolate(local, [7, 20], [40, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Bulb glow filter intensity
  const glowFilter = interpolate(local, [7, 12, 30, durationInFrames], [0, 25, 12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bulb subtle float after turning on
  const floatY = local > 12 ? Math.sin((local - 12) * 0.15) * 4 : 0;

  // Exit
  const exitOpacity = interpolate(
    local,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Sparkle particles — two rings, different sizes
  const sparkles = [
    // Inner ring — fast, small
    { angle: 0, dist: 160, size: 10, delay: 8 },
    { angle: 72, dist: 150, size: 8, delay: 9 },
    { angle: 144, dist: 165, size: 12, delay: 10 },
    { angle: 216, dist: 155, size: 9, delay: 9 },
    { angle: 288, dist: 170, size: 11, delay: 8 },
    // Outer ring — slower, bigger
    { angle: 36, dist: 260, size: 14, delay: 11 },
    { angle: 108, dist: 250, size: 16, delay: 12 },
    { angle: 180, dist: 270, size: 13, delay: 13 },
    { angle: 252, dist: 245, size: 15, delay: 12 },
    { angle: 324, dist: 255, size: 12, delay: 11 },
    // Scattered micro-sparkles
    { angle: 20, dist: 200, size: 6, delay: 10 },
    { angle: 95, dist: 210, size: 5, delay: 11 },
    { angle: 160, dist: 190, size: 7, delay: 12 },
    { angle: 230, dist: 220, size: 6, delay: 10 },
    { angle: 310, dist: 195, size: 5, delay: 13 },
  ];

  return (
    <>
      {/* ── Full-screen golden flash ────────────────────────────────────── */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 38%, rgba(255,215,0,0.9) 0%, rgba(255,170,0,0.4) 40%, transparent 70%)",
          opacity: flashOpacity * exitOpacity,
        }}
      />

      {/* ── Warm screen tint during glow ────────────────────────────────── */}
      <AbsoluteFill
        style={{
          backgroundColor: "rgba(255,200,50,0.08)",
          opacity: interpolate(local, [10, 16, 36, durationInFrames], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * exitOpacity,
        }}
      />

      {/* ── Main lightbulb container ────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "36%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${bulbScale}) translateY(${floatY}px)`,
          opacity: bulbOpacity * exitOpacity,
          width: 340,
          height: 400,
        }}
      >
        {/* Expanding glow behind bulb */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,215,0,0.7) 0%, rgba(255,132,18,0.3) 40%, rgba(0,163,255,0.1) 70%, transparent 90%)",
            transform: `translate(-50%, -50%) scale(${glowScale})`,
            opacity: glowOpacity,
            filter: "blur(20px)",
          }}
        />

        {/* Rotating light rays */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: `translate(-50%, -50%) rotate(${rayRotation}deg)`,
            opacity: rayOpacity,
          }}
        >
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
            <div
              key={angle}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 4,
                height: rayLength,
                background:
                  "linear-gradient(to top, rgba(255,215,0,0.9), rgba(255,170,0,0.3), transparent)",
                transformOrigin: "bottom center",
                transform: `translate(-50%, -100%) rotate(${angle}deg) translateY(-60px)`,
                borderRadius: 2,
              }}
            />
          ))}
        </div>

        {/* ── Tutero brand lightbulb (from logo SVG) ──────────────────── */}
        <svg
          viewBox="0 0 80 120"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 260,
            height: 390,
            transform: "translate(-50%, -50%)",
            filter: lightOn > 0.3
              ? `drop-shadow(0 0 ${glowFilter}px rgba(255,215,0,0.9)) drop-shadow(0 0 ${glowFilter * 2}px rgba(255,132,18,0.5))`
              : "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
            transition: "filter 0.1s",
          }}
        >
          <defs>
            {/* Brand gradient (orange → gold → teal → blue) */}
            <linearGradient id="bulbGradient" x1="38.7" y1="0" x2="38.7" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF8412" />
              <stop offset="41.7%" stopColor="#F8B200" />
              <stop offset="73.8%" stopColor="#4CB092" />
              <stop offset="86.4%" stopColor="#00A3FF" />
              <stop offset="100%" stopColor="#1D49E3" />
            </linearGradient>
            {/* Dim version for "off" state */}
            <linearGradient id="bulbGradientDim" x1="38.7" y1="0" x2="38.7" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8B7355" />
              <stop offset="41.7%" stopColor="#8B8060" />
              <stop offset="73.8%" stopColor="#5B7B6E" />
              <stop offset="86.4%" stopColor="#557788" />
              <stop offset="100%" stopColor="#4B5570" />
            </linearGradient>
          </defs>

          {/* Inner warm glow (visible when on) */}
          <path
            opacity={0.62 * lightOn}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.47 52.59C9.59 46.96 8.25 43.24 8.91 38.14C11.52 18.04 25.75 8.77 39.69 8.77C53.63 8.77 67.85 18.04 70.46 38.14C71.13 43.24 69.79 46.96 66.91 52.59C66.51 53.36 66.09 54.17 65.64 55.02C62.82 60.36 59.15 67.34 57.15 76.57C56.17 81.05 53.04 83.13 50.8 83.13H47.08C45.51 82.92 44.28 81.6 44.16 80L44.16 42.7H53.67C56.13 42.7 58.14 40.69 58.14 38.21C58.14 35.74 56.13 33.73 53.67 33.73H25.71C23.24 33.73 21.24 35.74 21.24 38.21C21.24 40.69 23.24 42.7 25.71 42.7H35.22V80.04C35.1 81.62 33.89 82.92 32.35 83.13H28.58C26.34 83.13 23.21 81.05 22.23 76.57C20.23 67.34 16.56 60.36 13.74 55.02C13.29 54.17 12.87 53.36 12.47 52.59Z"
            fill="#FFF5D6"
          />

          {/* White highlight */}
          <path
            d="M17 27.12C16.67 27.98 17.7 28.57 18.37 27.94C20.9 25.54 23.88 23.14 27.2 20.88C29.95 19 32.71 17.37 35.37 16.02C36.19 15.61 35.99 14.45 35.07 14.47C33.05 14.53 31 14.89 29 15.6C23.29 17.6 19.06 21.92 17 27.12Z"
            fill="white"
            opacity={interpolate(lightOn, [0, 1], [0.3, 0.9])}
          />

          {/* Main outer shape — transitions from dim to brand gradient */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.06 59.24C2.32 52.1 -0.92 45.93 0.24 37C6.65 -12.33 72.73 -12.33 79.14 37C80.3 45.93 77.06 52.1 73.32 59.24C70.51 64.58 67.42 70.45 65.7 78.43C64.11 85.74 58.27 91.9 50.8 91.9H28.58C21.11 91.9 15.27 85.74 13.69 78.43C11.96 70.45 8.87 64.58 6.06 59.24ZM12.47 52.59C9.59 46.96 8.25 43.24 8.91 38.14C11.53 18.04 25.75 8.77 39.69 8.77C53.63 8.77 67.85 18.04 70.46 38.14C71.13 43.24 69.79 46.96 66.91 52.59C66.51 53.36 66.09 54.17 65.64 55.02C62.82 60.36 59.15 67.34 57.15 76.57C56.17 81.05 53.04 83.13 50.8 83.13H47.08C45.51 82.92 44.28 81.6 44.16 80V42.7H53.67C56.13 42.7 58.14 40.69 58.14 38.21C58.14 35.74 56.13 33.73 53.67 33.73H25.71C23.24 33.73 21.24 35.74 21.24 38.21C21.24 40.69 23.24 42.7 25.71 42.7H35.22V80.04C35.1 81.62 33.89 82.92 32.35 83.13H28.58C26.34 83.13 23.21 81.05 22.23 76.57C20.23 67.34 16.56 60.36 13.74 55.02C13.29 54.17 12.87 53.36 12.47 52.59Z"
            fill={lightOn > 0.5 ? "url(#bulbGradient)" : "url(#bulbGradientDim)"}
          />

          {/* Bottom ring */}
          <path
            d="M49.24 111.1C51.73 111.1 53.74 113.09 53.74 115.55C53.74 118.01 51.73 120 49.24 120H30.14C27.65 120 25.64 118.01 25.64 115.55C25.64 113.09 27.65 111.1 30.14 111.1H49.24Z"
            fill={lightOn > 0.5 ? "url(#bulbGradient)" : "url(#bulbGradientDim)"}
          />

          {/* Middle ring */}
          <path
            d="M58.24 101.59C58.24 99.13 56.22 97.14 53.74 97.14H25.64C23.16 97.14 21.14 99.13 21.14 101.59C21.14 104.04 23.16 106.03 25.64 106.03H53.74C56.22 106.03 58.24 104.04 58.24 101.59Z"
            fill={lightOn > 0.5 ? "url(#bulbGradient)" : "url(#bulbGradientDim)"}
          />
        </svg>

        {/* ── Sparkle particles ─────────────────────────────────────────── */}
        {sparkles.map(({ angle, dist, size, delay }, i) => {
          const sparkleLocal = Math.max(0, local - delay);
          const sparkleProgress = interpolate(sparkleLocal, [0, 12], [0, 1], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          });
          const sparkleOpacity = interpolate(
            sparkleLocal,
            [0, 3, 10, 20],
            [0, 1, 0.8, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * dist * sparkleProgress;
          const y = Math.sin(rad) * dist * sparkleProgress;
          const sparkleRotate = sparkleLocal * 8;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${sparkleRotate}deg)`,
                opacity: sparkleOpacity * exitOpacity,
              }}
            >
              {/* 4-point star sparkle */}
              <svg width={size * 2} height={size * 2} viewBox="0 0 24 24">
                <path
                  d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z"
                  fill="#FFD700"
                  filter="drop-shadow(0 0 4px rgba(255,215,0,0.8))"
                />
              </svg>
            </div>
          );
        })}
      </div>
    </>
  );
};
