const imageSrc = "/test-qr-image.png"; // ✅ Path to your test QR code image
const canvasElement = ref<HTMLCanvasElement | null>(null);

const startScanning = async () => {
  if (cameraAvailable.value) {
    // ✅ Use real camera feed
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    videoElement.value!.srcObject = stream;
    videoElement.value!.setAttribute("playsinline", "true");
    videoElement.value!.play();
    scanContinuously();
  } else {
    // ✅ Use canvas-based simulation
    simulateCameraWithImage();
  }
};

// ✅ Simulate Camera Feed Using a `Canvas`
const simulateCameraWithImage = () => {
  if (!canvasElement.value) return;

  const ctx = canvasElement.value.getContext("2d");
  if (!ctx) return;

  const img = new Image();
  img.src = imageSrc;

  img.onload = () => {
    canvasElement.value!.width = img.width;
    canvasElement.value!.height = img.height;

    const drawFrame = () => {
      if (!cameraDialog.value) return;

      ctx.drawImage(img, 0, 0, img.width, img.height);
      requestAnimationFrame(drawFrame);
    };

    drawFrame();
    scanFromCanvas();
  };
};

// ✅ Scan QR Code from Canvas
const scanFromCanvas = async () => {
  if (!canvasElement.value) return;

  const ctx = canvasElement.value.getContext("2d");
  if (!ctx) return;

  try {
    const imageData = ctx.getImageData(0, 0, canvasElement.value.width, canvasElement.value.height);
    const result = await codeReader!.decodeFromImageData(imageData);
    qrCodeData.value = result.getText();
    closeCamera();
  } catch (error) {
    console.warn("No QR code found, retrying...");
    setTimeout(scanFromCanvas, 1000);
  }
};
