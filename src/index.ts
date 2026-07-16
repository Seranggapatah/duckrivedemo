/* 
  Rive (Web) - Data Binding Images
  Swap out the image in a Rive file for a random image in a defined location.

  References: 
  - Rive Source File: https://rive.app/community/files/25472-47537-data-binding-images/
  - Asset Swapping: https://rive.app/docs/runtimes/loading-assets#web-js
  - Data Binding: https://rive.app/docs/runtimes/data-binding#web
*/

import "./styles.css";
import { Fit, Rive, Layout, decodeImage } from "@rive-app/webgl2";

// Define types for better type safety
interface RiveImage {
  unref(): void;
}

interface ImageProperty {
  value: RiveImage;
}

interface TriggerProperty {
  trigger(): void;
  on(callback: () => void): void;
}

interface ViewModelInstance {
  image(name: string): ImageProperty;
  trigger(name: string): TriggerProperty;
}

// The layout of the graphic will adhere to
const layout = new Layout({
  fit: Fit.Layout,
});

// HTML Canvas element to render to
const riveCanvas = document.getElementById("rive-canvas") as HTMLCanvasElement;
const swapHeadBtn = document.getElementById(
  "swap-head-btn",
) as HTMLButtonElement;
const swapBodyBackBtn = document.getElementById(
  "swap-body-back-btn",
) as HTMLButtonElement;
const swapBodyFrontBtn = document.getElementById(
  "swap-body-front-btn",
) as HTMLButtonElement;
const swapImageBtn = document.getElementById(
  "swap-image-btn",
) as HTMLButtonElement;
const swapShirtBtn = document.getElementById(
  "swap-shirt-btn",
) as HTMLButtonElement;
const swapBootBtn = document.getElementById(
  "swap-boot-btn",
) as HTMLButtonElement;
const triggerIdleBtn = document.getElementById(
  "idle-image-btn",
) as HTMLButtonElement;
const triggerCelebrateBtn = document.getElementById(
  "celebrate-image-btn",
) as HTMLButtonElement;
// Parcel must resolve asset URLs at build time — plain paths like "src/images/..." 404 in dev
const imageUrls: string[] = [
  new URL("./images/hat1.png", import.meta.url).href,
  new URL("./images/hat2.png", import.meta.url).href,
  new URL("./images/hat3.png", import.meta.url).href,
];

// Placeholder shirt images — replace PNGs in src/images/ when ready
const shirtImageUrls: string[] = [
  new URL("./images/arm1.png", import.meta.url).href,
  new URL("./images/arm2.png", import.meta.url).href,
  new URL("./images/arm3.png", import.meta.url).href,
];

// Placeholder body front images — replace PNGs in src/images/ when ready
const bodyFrontImageUrls: string[] = [
  new URL("./images/body1.png", import.meta.url).href,
  new URL("./images/body2.png", import.meta.url).href,
  new URL("./images/body3.png", import.meta.url).href,
  new URL("./images/body4.png", import.meta.url).href,
];

// Placeholder boot images — replace PNGs in src/images/ when ready
const bootImageUrls: string[] = [
  new URL("./images/Boot1.png", import.meta.url).href,
  new URL("./images/Boot2.png", import.meta.url).href,
  new URL("./images/Boot3.png", import.meta.url).href,
  new URL("./images/Boot4.png", import.meta.url).href,
];

// Placeholder body back images — replace PNGs in src/images/ when ready
const bodyBackImageUrls: string[] = [
  new URL("./images/bodyBack1.png", import.meta.url).href,
];

// Placeholder head images — replace PNGs in src/images/ when ready
const headImageUrls: string[] = [
  new URL("./images/Head1.png", import.meta.url).href,
];

const riveSrc = new URL("../duck_mascot_final.riv", import.meta.url).href;

// Function to load a random image
const loadRandomImage = async (
  imageProperty: ImageProperty,
  urls: string[] = imageUrls,
): Promise<void> => {
  const randomIndex = Math.floor(Math.random() * urls.length);
  const imageUrl = urls[randomIndex];

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${imageUrl}`);
    }
    const image = await decodeImage(new Uint8Array(await res.arrayBuffer()));

    imageProperty.value = image;
    console.log(`Loaded: ${imageUrl}`);
  } catch (error) {
    console.error(`Failed to load ${imageUrl}:`, error);
  }
};

const r = new Rive({
  src: riveSrc,
  canvas: riveCanvas,
  artboard: "Main",
  stateMachines: "State Machine 1",
  layout: layout,
  autoplay: true,
  autoBind: true,
  onLoad: (): void => {
    r.resizeDrawingSurfaceToCanvas();
    const vmi = r.viewModelInstance as ViewModelInstance;
    if (!vmi) return;

    const imageHat = vmi.image("imageHat");
    const imageHead = vmi.image("imageHead");
    const imageShirt = vmi.image("imageShirt");
    const imageBodyFront = vmi.image("imageBodyFront");
    const imageBodyback = vmi.image("imageBodyback");
    const imageBoot = vmi.image("imageBoot");
    const triggerWeaving = vmi.trigger("triggerWeaving");
    const triggerCelebrate = vmi.trigger("triggerCelebration");

    const swapImage = (): void => {
      loadRandomImage(imageHat);
    };

    const swapHead = (): void => {
      loadRandomImage(imageHead, headImageUrls);
    };

    const swapShirt = (): void => {
      loadRandomImage(imageShirt, shirtImageUrls);
    };

    const swapBodyFront = (): void => {
      loadRandomImage(imageBodyFront, bodyFrontImageUrls);
    };

    const swapBodyBack = (): void => {
      loadRandomImage(imageBodyback, bodyBackImageUrls);
    };

    const swapBoot = (): void => {
      loadRandomImage(imageBoot, bootImageUrls);
    };

    swapHeadBtn.disabled = false;
    swapBodyBackBtn.disabled = false;
    swapBodyFrontBtn.disabled = false;
    swapImageBtn.disabled = false;
    swapShirtBtn.disabled = false;
    swapBootBtn.disabled = false;
    triggerIdleBtn.disabled = false;
    triggerCelebrateBtn.disabled = false;

    swapHeadBtn.addEventListener("click", swapHead);
    swapImageBtn.addEventListener("click", swapImage);
    swapShirtBtn.addEventListener("click", swapShirt);
    swapBodyBackBtn.addEventListener("click", swapBodyBack);
    swapBodyFrontBtn.addEventListener("click", swapBodyFront);
    swapBootBtn.addEventListener("click", swapBoot);

    triggerIdleBtn.addEventListener("click", () => {
      triggerWeaving?.trigger();
    });
    triggerCelebrateBtn.addEventListener("click", () => {
      triggerCelebrate.trigger();
    });
  },
});

// Re-adjust the rendering surface if the window resizes
window.addEventListener("resize", () => {
  r.resizeDrawingSurfaceToCanvas();
});
