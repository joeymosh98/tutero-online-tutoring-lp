import {
  AbsoluteFill,
  Audio,
  Video,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Easing,
} from "remotion";

// ── Storyboard — "Watch your child's confidence grow" ───────────────────────
// 4 clips of the same boy showing a confidence arc, fast cuts, TikTok typo.
//
// | Clip | Time     | Visual                  | Main Text          | BG Text                    |
// |------|----------|-------------------------|--------------------|----------------------------|
// | 1    | 0-2.5s   | Side profile, uncertain | "Watch your child's"| "1-on-1 online tutoring"  |
// | 2    | 2.5-5s   | Starting to nod/think   | "confidence"       | "matched with the right tutor" |
// | 3    | 5-7.5s   | Big smile, gets it      | "GROW"             | "top 1.3% of tutors"       |
// | 4    | 7.5-10s  | Laughing, fully engaged  | "with the right tutor." | "no contracts ever"   |
// | End  | 10-13s   | Branded end card         | CTA                |                            |

const CLIPS = [
  {
    file: "boy-01-uncertain.mp4",
    text: ["Watch your", "child's"],
    highlight: null,
    bgText: "1-on-1 online tutoring",
  },
  {
    file: "boy-02-thinking.mp4",
    text: ["confidence"],
    highlight: "confidence",
    bgText: "matched with the right tutor",
  },
  {
    file: "boy-03-smile.mp4",
    text: ["GROW"],
    highlight: "GROW",
    bgText: "top 1.3% of tutors",
  },
  {
    file: "boy-04-confident.mp4",
    text: ["with the right", "tutor."],
    highlight: "tutor.",
    bgText: "no contracts ever",
  },
];

type Props = {
  clipDurationFrames: number;
};

export const TuteroAd: React.FC<Props> = ({ clipDurationFrames }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ── Video clips ─────────────────────────────────────────────── */}
      {CLIPS.map((clip, i) => (
        <Sequence
          key={clip.file}
          from={i * clipDurationFrames}
          durationInFrames={clipDurationFrames}
        >
          <ClipWithTransition
            src={staticFile(clip.file)}
            textLines={clip.text}
            highlightWord={clip.highlight}
            bgText={clip.bgText}
            clipDurationFrames={clipDurationFrames}
          />
        </Sequence>
      ))}

      {/* ── End card ────────────────────────────────────────────────── */}
      <Sequence
        from={CLIPS.length * clipDurationFrames}
        durationInFrames={90}
      >
        <EndCard />
      </Sequence>

      {/* ── Voiceover ───────────────────────────────────────────────── */}
      <Audio src={staticFile("voiceover.mp3")} volume={1} />
    </AbsoluteFill>
  );
};

// ── Clip with video + TikTok text + background text ─────────────────────────
const ClipWithTransition: React.FC<{
  src: string;
  textLines: string[];
  highlightWord: string | null;
  bgText: string;
  clipDurationFrames: number;
}> = ({ src, textLines, highlightWord, bgText, clipDurationFrames }) => {
  const frame = useCurrentFrame();

  // Quick cut fade (2 frames)
  const fadeIn = interpolate(frame, [0, 2], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Slow Ken Burns zoom
  const scale = interpolate(frame, [0, clipDurationFrames], [1, 1.05], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Video
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />

      {/* Dark gradient overlay for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 30%, transparent 50%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* Background text — top area, subtle */}
      <BackgroundText text={bgText} />

      {/* Main TikTok-style text overlay — center */}
      <TikTokText
        lines={textLines}
        highlightWord={highlightWord}
        clipDurationFrames={clipDurationFrames}
      />
    </AbsoluteFill>
  );
};

// ── Background Text — subtle proof point at top ─────────────────────────────
const BackgroundText: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide down from top with delay
  const slideDown = spring({
    frame: frame - 6,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  const opacity = interpolate(frame, [4, 14], [0, 0.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity,
        transform: `translateY(${interpolate(slideDown, [0, 1], [-20, 0])}px)`,
      }}
    >
      <span
        style={{
          color: "rgba(255,255,255,0.9)",
          fontSize: 30,
          fontWeight: 600,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: 3,
          textTransform: "uppercase",
          backgroundColor: "rgba(0,0,0,0.35)",
          padding: "10px 28px",
          borderRadius: 8,
          backdropFilter: "blur(4px)",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ── TikTok Typography ───────────────────────────────────────────────────────
// Bold chunky white text with thick black stroke, punch-in animation
const TikTokText: React.FC<{
  lines: string[];
  highlightWord: string | null;
  clipDurationFrames: number;
}> = ({ lines, highlightWord }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Punch-in spring animation
  const punch = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.6 },
  });

  const scale = interpolate(punch, [0, 1], [1.4, 1]);
  const opacity = interpolate(frame, [0, 4], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        {lines.map((line, i) => {
          const isHighlight =
            highlightWord && line.includes(highlightWord);

          return (
            <div
              key={i}
              style={{
                color: isHighlight ? "#FFD700" : "#ffffff",
                fontSize: isHighlight ? 120 : 72,
                fontWeight: 900,
                fontFamily:
                  "'Inter', 'Helvetica Neue', 'Arial Black', system-ui, sans-serif",
                lineHeight: 1.1,
                letterSpacing: isHighlight ? 4 : 1,
                textTransform: isHighlight ? "uppercase" : "none",
                // TikTok thick black stroke effect
                WebkitTextStroke: isHighlight
                  ? "4px rgba(0,0,0,0.8)"
                  : "3px rgba(0,0,0,0.7)",
                textShadow: [
                  "0 4px 12px rgba(0,0,0,0.8)",
                  "0 2px 4px rgba(0,0,0,0.6)",
                  "2px 2px 0 rgba(0,0,0,0.5)",
                  "-2px -2px 0 rgba(0,0,0,0.5)",
                ].join(", "),
                marginBottom: 8,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── End Card ────────────────────────────────────────────────────────────────
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const buttonPunch = spring({
    frame: frame - 12,
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.6 },
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, #0a0a0a 0%, #0f172a 40%, #1e3a5f 100%)",
        justifyContent: "center",
        alignItems: "center",
        opacity: interpolate(frame, [0, 4], [0, 1], {
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div
        style={{
          transform: `scale(${interpolate(appear, [0, 1], [0.85, 1])})`,
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div
          style={{
            color: "#ffffff",
            fontSize: 96,
            fontWeight: 900,
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: 8,
            marginBottom: 24,
          }}
        >
          TUTERO
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 34,
            fontWeight: 500,
            fontFamily: "Inter, system-ui, sans-serif",
            marginBottom: 56,
          }}
        >
          Top 1.3% of tutors who apply.
        </div>

        {/* CTA — TikTok punch style */}
        <div
          style={{
            transform: `scale(${interpolate(
              buttonPunch,
              [0, 1],
              [1.3, 1]
            )})`,
            opacity: interpolate(buttonPunch, [0, 1], [0, 1]),
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontSize: 48,
              fontWeight: 800,
              fontFamily: "Inter, system-ui, sans-serif",
              padding: "28px 56px",
              borderRadius: 60,
              display: "inline-block",
              boxShadow: "0 8px 40px rgba(255,255,255,0.2)",
            }}
          >
            Book a Free Lesson
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 28,
            fontWeight: 500,
            fontFamily: "Inter, system-ui, sans-serif",
            marginTop: 24,
            letterSpacing: 1,
          }}
        >
          tutero.com.au
        </div>

        {/* No contract badge */}
        <div
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 24,
            fontWeight: 400,
            fontFamily: "Inter, system-ui, sans-serif",
            marginTop: 16,
          }}
        >
          No contracts. No upfront payment.
        </div>
      </div>
    </AbsoluteFill>
  );
};
