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

const layout = new Layout({
  fit: Fit.Layout,
});

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

const imageUrls: string[] = [
  new URL("./images/hat1.png", import.meta.url).href,
  new URL("./images/hat2.png", import.meta.url).href,
  new URL("./images/hat3.png", import.meta.url).href,
];

const shirtImageUrls: string[] = [
  new URL("./images/arm1.png", import.meta.url).href,
  new URL("./images/arm2.png", import.meta.url).href,
  new URL("./images/arm3.png", import.meta.url).href,
];

const bodyFrontImageUrls: string[] = [
  new URL("./images/body1.png", import.meta.url).href,
  new URL("./images/body2.png", import.meta.url).href,
  new URL("./images/body3.png", import.meta.url).href,
  new URL("./images/body4.png", import.meta.url).href,
];

const bootImageUrls: string[] = [
  new URL("./images/Boot1.png", import.meta.url).href,
  new URL("./images/Boot2.png", import.meta.url).href,
  new URL("./images/Boot3.png", import.meta.url).href,
  new URL("./images/Boot4.png", import.meta.url).href,
];

const bodyBackImageUrls: string[] = [
  new URL("./images/bodyBack1.png", import.meta.url).href,
];

const headImageUrls: string[] = [
  new URL("./images/Head1.png", import.meta.url).href,
];

const riveSrc = new URL("../duck_mascot_FINAL.riv", import.meta.url).href;

const logDebug = (
  label: string,
  message: string,
  data?: unknown,
): void => {
  const time = new Date().toLocaleTimeString();
  if (data !== undefined) {
    console.log(`[${time}] [${label}] ${message}`, data);
    return;
  }
  console.log(`[${time}] [${label}] ${message}`);
};

const bindSwapButton = (
  button: HTMLButtonElement,
  label: string,
  onSwap: () => void,
): void => {
  button.addEventListener("pointerdown", () => {
    logDebug(label, "Tombol ditekan");
  });

  button.addEventListener("click", () => {
    logDebug(label, "Tombol diklik, mulai swap image...");
    onSwap();
  });
};

const bindTriggerButton = (
  button: HTMLButtonElement,
  label: string,
  onTrigger: () => void,
): void => {
  button.addEventListener("pointerdown", () => {
    logDebug(label, "Tombol ditekan");
  });

  button.addEventListener("click", () => {
    logDebug(label, "Tombol diklik, trigger animation...");
    onTrigger();
  });
};

const getImageProperty = (
  vmi: ViewModelInstance,
  name: string,
): ImageProperty | null => {
  try {
    const property = vmi.image(name);
    if (!property) {
      console.error(`ViewModel image "${name}" not found`);
      return null;
    }
    logDebug("VM Bind", `image "${name}" OK`);
    return property;
  } catch (error) {
    console.error(`Failed to bind ViewModel image "${name}":`, error);
    return null;
  }
};

const loadRandomImage = async (
  imageProperty: ImageProperty | null,
  urls: string[],
  label: string,
): Promise<void> => {
  if (!imageProperty) {
    console.error(`[${label}] Image property is not available`);
    return;
  }

  if (urls.length === 0) {
    console.error(`[${label}] No image URLs configured`);
    return;
  }

  const randomIndex = Math.floor(Math.random() * urls.length);
  const imageUrl = urls[randomIndex];

  logDebug(label, "Fetching image...", {
    index: randomIndex,
    total: urls.length,
    url: imageUrl,
  });

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${imageUrl}`);
    }

    logDebug(label, "Fetch OK, decoding PNG...");
    const image = await decodeImage(new Uint8Array(await res.arrayBuffer()));
    logDebug(label, "Decode OK, assign ke ViewModel image...");

    const previousImage = imageProperty.value;
    imageProperty.value = image;
    previousImage?.unref();

    logDebug(label, "Image berhasil di-load dan di-assign", {
      url: imageUrl,
      hasPreviousImage: Boolean(previousImage),
    });
  } catch (error) {
    console.error(`[${label}] Failed to load ${imageUrl}:`, error);
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
    logDebug("Rive", "File loaded");
    r.resizeDrawingSurfaceToCanvas();
    const vmi = r.viewModelInstance as ViewModelInstance | null;
    if (!vmi) {
      console.error("ViewModel instance not available");
      return;
    }

    logDebug("Rive", "ViewModel instance ready");

    const imageHat = getImageProperty(vmi, "imageHat");
    const imageHead = getImageProperty(vmi, "imageHead");
    const imageShirt = getImageProperty(vmi, "imageShirt");
    const imageBodyFront = getImageProperty(vmi, "imageBodyFront");
    const imageBodyback = getImageProperty(vmi, "imageBodyback");
    const imageBoot = getImageProperty(vmi, "imageBoot");
    const triggerWeaving = vmi.trigger("triggerWeaving");
    const triggerCelebrate = vmi.trigger("triggerCelebration");

    logDebug("Shirt Debug", "Status binding imageShirt", {
      bound: Boolean(imageShirt),
      urls: shirtImageUrls,
    });

    const swapButtons = [
      swapHeadBtn,
      swapBodyBackBtn,
      swapBodyFrontBtn,
      swapImageBtn,
      swapShirtBtn,
      swapBootBtn,
      triggerIdleBtn,
      triggerCelebrateBtn,
    ];

    bindSwapButton(swapHeadBtn, "Head", () => {
      loadRandomImage(imageHead, headImageUrls, "Head");
    });
    bindSwapButton(swapImageBtn, "Hat", () => {
      loadRandomImage(imageHat, imageUrls, "Hat");
    });
    bindSwapButton(swapShirtBtn, "Shirt", () => {
      loadRandomImage(imageShirt, shirtImageUrls, "Shirt");
    });
    bindSwapButton(swapBodyFrontBtn, "Body Front", () => {
      loadRandomImage(imageBodyFront, bodyFrontImageUrls, "Body Front");
    });
    bindSwapButton(swapBodyBackBtn, "Body Back", () => {
      loadRandomImage(imageBodyback, bodyBackImageUrls, "Body Back");
    });
    bindSwapButton(swapBootBtn, "Boot", () => {
      loadRandomImage(imageBoot, bootImageUrls, "Boot");
    });

    bindTriggerButton(triggerIdleBtn, "Weaving", () => {
      triggerWeaving?.trigger();
    });
    bindTriggerButton(triggerCelebrateBtn, "Celebrate", () => {
      triggerCelebrate.trigger();
    });

    swapButtons.forEach((button) => {
      button.disabled = false;
    });

    logDebug("Rive", "Semua tombol aktif. Buka DevTools Console (F12) untuk debug.");
  },
});

window.addEventListener("resize", () => {
  r.resizeDrawingSurfaceToCanvas();
});
