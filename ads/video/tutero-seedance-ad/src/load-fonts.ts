import { continueRender, delayRender, staticFile } from "remotion";

const waitForFont = delayRender("Loading Satoshi font");

const satoshiBlack = new FontFace(
  "Satoshi",
  `url('${staticFile("fonts/Satoshi-Black.woff2")}') format('woff2')`,
  { weight: "900", style: "normal" }
);

const satoshiBold = new FontFace(
  "Satoshi",
  `url('${staticFile("fonts/Satoshi-Bold.woff2")}') format('woff2')`,
  { weight: "700", style: "normal" }
);

Promise.all([satoshiBlack.load(), satoshiBold.load()])
  .then((fonts) => {
    fonts.forEach((f) => document.fonts.add(f));
    continueRender(waitForFont);
  })
  .catch((err) => {
    console.error("Font load failed, using fallback:", err);
    continueRender(waitForFont);
  });
