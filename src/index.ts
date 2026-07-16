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
const swapImageBtn = document.getElementById(
  "swap-image-btn",
) as HTMLButtonElement;
const triggerIdleBtn = document.getElementById(
  "idle-image-btn",
) as HTMLButtonElement;
const triggerCelebrateBtn = document.getElementById(
  "celebrate-image-btn",
) as HTMLButtonElement;
// Parcel must resolve asset URLs at build time — plain paths like "src/images/..." 404 in dev
const imageUrls: string[] = [
  new URL("./images/hat11.png", import.meta.url).href,
  new URL("./images/hat2.png", import.meta.url).href,
  new URL("./images/hat3.png", import.meta.url).href,
];

const riveSrc = new URL("../duck_mascot_update.riv", import.meta.url).href;

// Function to load a random image
const loadRandomImage = async (imageProperty: ImageProperty): Promise<void> => {
  const randomIndex = Math.floor(Math.random() * imageUrls.length);
  const imageUrl = imageUrls[randomIndex];

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

    const imageProperty = vmi.image("imageHat");
    const triggerWeaving = vmi.trigger("triggerWeaving");
    const triggerCelebrate = vmi.trigger("triggerCelebration");

    const swapImage = (): void => {
      loadRandomImage(imageProperty);
    };

    swapImageBtn.disabled = false;
    triggerIdleBtn.disabled = false;
    triggerCelebrateBtn.disabled = false;

    swapImageBtn.addEventListener("click", swapImage);

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
