import React from "react";
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  staticFile,
} from "remotion";
import { tutoringPalette, fontStacks } from "./theme";
import "./load-fonts";

// ── End card — 210 frames (7s) at 30fps ─────────────────────────────────────
//
// Phase 1  (0–15):   Logo + "1-on-1 tutoring" spring in
// Phase 2  (15–35):  CTA pill bounces in, glow ring starts
// Phase 3  (35–80):  Reassurance text fades in, shimmer sweep on CTA
// Phase 4  (80–210): Persistent finger tap animation pointing to Meta CTA,
//                    pulsing glow, floating bg particles — holds until cut
//

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const compact = height < 1500; // 4:5 (1350) vs 9:16 (1920)

  // ═══════════════════════════════════════════════════════════════════════
  // PHASE 1 — Logo entry
  // ═══════════════════════════════════════════════════════════════════════

  const appear = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 160 },
    durationInFrames: 10,
  });
  const logoScale = interpolate(appear, [0, 1], [0.8, 1]);
  const fadeIn = interpolate(frame, [0, 4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PHASE 2 — CTA pill
  // ═══════════════════════════════════════════════════════════════════════

  const ctaSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.6 },
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.4, 1]);
  const ctaOpacity = interpolate(ctaSpring, [0, 1], [0, 1]);

  // CTA breathing pulse (starts after landing)
  const pulsePhase = Math.max(0, frame - 35);
  const ctaPulse = 1 + Math.sin(pulsePhase * 0.16) * 0.02;

  // Glow ring — pulses in sync, grows stronger over time
  const glowIntensity = interpolate(frame, [30, 80], [0.15, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glowPulse = interpolate(
    Math.sin(pulsePhase * 0.16),
    [-1, 1],
    [glowIntensity * 0.5, glowIntensity]
  );

  // ═══════════════════════════════════════════════════════════════════════
  // PHASE 3 — Shimmer sweep across CTA pill
  // ═══════════════════════════════════════════════════════════════════════

  // Repeating shimmer — sweeps every 60 frames (2s), starts at frame 40
  const shimmerCycle = Math.max(0, frame - 40) % 60;
  const shimmerX = interpolate(shimmerCycle, [0, 20], [-120, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const shimmerOpacity =
    frame > 40
      ? interpolate(shimmerCycle, [0, 8, 12, 20], [0, 0.5, 0.5, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // ═══════════════════════════════════════════════════════════════════════
  // PHASE 3 — Reassurance text
  // ═══════════════════════════════════════════════════════════════════════

  // Reassurance text — fades in when Emma says it (frame 78 within end card = 468 global)
  // then stays visible
  const reassuranceOpacity = interpolate(frame, [78, 95], [0, 0.65], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PHASE 4 — Tap finger animation (after contracts VO ends ~frame 164 in end card)
  // ═══════════════════════════════════════════════════════════════════════

  const fingerDelay = 170;
  const fingerEntry = spring({
    frame: frame - fingerDelay,
    fps,
    config: { damping: 10, stiffness: 160 },
  });
  const fingerOpacity = interpolate(fingerEntry, [0, 1], [0, 1]);

  // Continuous "tapping" motion — finger moves down and back up
  const tapPhase = Math.max(0, frame - fingerDelay - 10);
  const tapCycle = tapPhase % 24; // taps every 0.8s
  const tapY = interpolate(tapCycle, [0, 6, 10, 14, 24], [0, 14, 8, 14, 0], {
    extrapolateRight: "clamp",
  });
  const tapScale = interpolate(tapCycle, [0, 6, 14, 24], [1, 0.92, 0.92, 1], {
    extrapolateRight: "clamp",
  });

  // Ripple ring on each "tap" impact
  const rippleProgress = interpolate(tapCycle, [6, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rippleScale = interpolate(rippleProgress, [0, 1], [0.5, 2.5]);
  const rippleOpacity = interpolate(rippleProgress, [0, 0.3, 1], [0, 0.4, 0]);

  // ═══════════════════════════════════════════════════════════════════════
  // BACKGROUND — subtle floating particles
  // ═══════════════════════════════════════════════════════════════════════

  const particles = [
    { x: 15, y: 20, speed: 0.03, size: 6, opacity: 0.15 },
    { x: 80, y: 35, speed: 0.025, size: 8, opacity: 0.12 },
    { x: 30, y: 70, speed: 0.035, size: 5, opacity: 0.18 },
    { x: 70, y: 80, speed: 0.02, size: 7, opacity: 0.1 },
    { x: 50, y: 15, speed: 0.028, size: 4, opacity: 0.14 },
    { x: 90, y: 60, speed: 0.032, size: 6, opacity: 0.12 },
    { x: 10, y: 50, speed: 0.022, size: 5, opacity: 0.16 },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: tutoringPalette.blue200,
        overflow: "hidden",
        opacity: fadeIn,
      }}
    >
      {/* ── Floating background particles ────────────────────────────────── */}
      {particles.map((p, i) => {
        const particleFade = interpolate(frame, [20, 40], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const floatY = Math.sin(frame * p.speed + i * 2) * 15;
        const floatX = Math.cos(frame * p.speed * 0.7 + i) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: tutoringPalette.blue500,
              opacity: p.opacity * particleFade,
              transform: `translate(${floatX}px, ${floatY}px)`,
            }}
          />
        );
      })}

      {/* ── Main content column ──────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: compact ? 10 : 20,
          paddingBottom: compact ? 40 : 100, // leave room for finger area at bottom
        }}
      >
        {/* ── Logo ───────────────────────────────────────────────────────── */}
        <Img
          src={staticFile("tutero-logo.svg")}
          style={{
            width: compact ? 400 : 520,
            height: "auto",
            transform: `scale(${logoScale})`,
          }}
        />

        {/* ── Sub-line ───────────────────────────────────────────────────── */}
        <div
          style={{
            fontSize: compact ? 42 : 52,
            fontWeight: 700,
            fontFamily: fontStacks.display,
            color: tutoringPalette.blue800,
            lineHeight: 1.2,
            transform: `scale(${logoScale})`,
          }}
        >
          1-on-1 tutoring
        </div>

        {/* ── CTA pill ───────────────────────────────────────────────────── */}
        <div
          style={{
            transform: `scale(${ctaScale * ctaPulse})`,
            opacity: ctaOpacity,
            marginTop: 24,
            position: "relative",
          }}
        >
          {/* Glow ring */}
          <div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: 999,
              boxShadow: `0 0 35px 10px rgba(0,163,255,${glowPulse})`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              backgroundColor: tutoringPalette.white,
              borderRadius: 999,
              padding: compact ? "20px 40px" : "26px 48px",
              boxShadow: "0 8px 28px rgba(0,82,204,0.22)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Shimmer highlight sweeping across */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                width: 60,
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                transform: `translateX(${shimmerX}%)`,
                opacity: shimmerOpacity,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                fontSize: compact ? 38 : 44,
                fontWeight: 700,
                fontFamily: fontStacks.display,
                color: tutoringPalette.blue500,
                whiteSpace: "nowrap",
                position: "relative",
              }}
            >
              Get a Free Quote
            </div>
          </div>
        </div>

        {/* ── Reassurance ────────────────────────────────────────────────── */}
        <div
          style={{
            opacity: reassuranceOpacity,
            fontSize: compact ? 26 : 30,
            fontWeight: 500,
            fontFamily: fontStacks.display,
            color: tutoringPalette.blue800,
            marginTop: compact ? 2 : 4,
          }}
        >
          No contracts. No upfront payment.
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TAP FINGER — points down to Meta's "Learn More" CTA button
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          bottom: compact ? 24 : 60,
          left: "50%",
          transform: `translateX(-50%) translateY(${tapY}px) scale(${tapScale})`,
          opacity: fingerOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Ripple ring on tap */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: `2px solid ${tutoringPalette.blue500}`,
            transform: `translate(-50%, -50%) scale(${rippleScale})`,
            opacity: rippleOpacity * fingerOpacity,
            pointerEvents: "none",
          }}
        />

        {/* Down arrow + "Tap below" label */}
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="26" fill={tutoringPalette.blue500} opacity="0.12" />
          <path
            d="M20 22L28 32L36 22"
            stroke={tutoringPalette.blue500}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 30L28 40L36 30"
            stroke={tutoringPalette.blue500}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />
        </svg>

        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            fontFamily: fontStacks.display,
            color: tutoringPalette.blue500,
            letterSpacing: "0.04em",
            opacity: 0.8,
          }}
        >
          TAP BELOW
        </div>
      </div>
    </div>
  );
};
