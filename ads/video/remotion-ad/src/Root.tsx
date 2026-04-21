import { Composition } from "remotion";
import { TuteroAd } from "./TuteroAd";

// 4 clips × 2.5s each + 3s end card = 13s total @ 30fps
const FPS = 30;
const CLIP_FRAMES = Math.round(2.5 * FPS); // 75 frames per clip
const END_CARD_FRAMES = Math.round(3 * FPS); // 90 frames
const TOTAL_FRAMES = CLIP_FRAMES * 4 + END_CARD_FRAMES; // 390

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TuteroAd"
      component={TuteroAd}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        clipDurationFrames: CLIP_FRAMES,
      }}
    />
  );
};
