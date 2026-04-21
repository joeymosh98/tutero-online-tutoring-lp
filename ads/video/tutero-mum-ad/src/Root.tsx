import React from "react";
import { Composition } from "remotion";
import { MumAd } from "./Composition";

// 15 seconds @ 30fps = 450 frames
// 1080×1920 vertical (9:16) for TikTok/Reels
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TuteroMumAd"
      component={MumAd}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
