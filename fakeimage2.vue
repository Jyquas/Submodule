<template>
  <div class="text-center pa-4">
    <!-- ✅ Show "Start Scanning" if a camera is detected -->
    <v-btn v-if="!scanningWithImage" @click="openCamera" color="primary">
      Start Scanning
    </v-btn>

    <!-- ✅ Show file upload if camera is NOT available -->
    <template v-if="!cameraAvailable && !scanningWithImage">
      <v-file-input
        ref="fileInputRef"
        v-model="selectedFile"
        label="Upload an Image"
        accept="image/*"
        show-size
        clearable
        @change="handleFileUpload"
      />
      <v-btn color="success" block @click="triggerFileSelect">
        Choose File
      </v-btn>
    </template>

    <dialog ref="dialog" class="modal">
      <form method="dialog" class="modal-box">
        <div class="modal-header">
          <h3>Scanning for QR Code</h3>
          <button @click.prevent="closeCamera" class="btn-close">✖</button>
        </div>

        <div class="modal-content">
          <!-- ✅ Show video if using a real camera -->
          <video v-if="cameraAvailable && !scanningWithImage" ref="videoElement" class="qr-video"></video>

          <!-- ✅ Show canvas if simulating the camera -->
          <canvas v-else ref="canvasElement" class="qr-canvas"></canvas>
        </div>

        <div class="modal-action">
          <button @click.prevent="closeCamera" class="btn btn-secondary">Close</button>
        </div>
      </form>
    </dialog>

    <v-alert v-if="qrCodeData" type="success" class="qr-result">
      QR Code Detected: {{ qrCodeData }}
    </v-alert>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick } from "vue";
import { BrowserMultiFormatReader, Result } from "@zxing/library";

export default defineComponent({
  name: "QrCodeScanner",
  setup() {
    const dialog = ref<HTMLDialogElement | null>(null);
    const cameraAvailable = ref<boolean>(false);
    const scanningWithImage = ref<boolean>(false);
    const qrCodeData = ref<string | null>(null);
    const selectedFile = ref<File | null>(null);
    const videoElement = ref<HTMLVideoElement | null>(null);
    const canvasElement = ref<HTMLCanvasElement | null>(null);
    const fileInputRef = ref<HTMLInputElement | null>(null);
    let codeReader: BrowserMultiFormatReader | null = null;
    let stream: MediaStream | null = null;
    let imageLoopActive = false;
    
    // ✅ Check if Camera is Available
    onMounted(async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameraAvailable.value = devices.some((device) => device.kind === "videoinput");
      } catch (error) {
        console.warn("No camera detected, switching to file upload mode.");
        cameraAvailable.value = false;
      }
    });

    // ✅ Open Camera and Start Scanning
    const openCamera = async () => {
      if (!dialog.value) return;
      dialog.value.showModal();
      await nextTick();

      if (cameraAvailable.value) {
        startScanning();
      } else {
        scanningWithImage.value = true;
        simulateCameraWithImage();
      }
    };

    // ✅ Start Scanning for QR Code
    const startScanning = async () => {
      if (!videoElement.value) return;

      codeReader = new BrowserMultiFormatReader();
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoElement.value.srcObject = stream;
        videoElement.value.setAttribute("playsinline", "true");
        videoElement.value.play();
        scanContinuously();
      } catch (error) {
        console.error("Error accessing camera:", error);
        closeCamera();
      }
    };

    // ✅ Simulate Camera Feed Using an Image
    const simulateCameraWithImage = () => {
      if (!canvasElement.value) return;
      scanningWithImage.value = true;
      imageLoopActive = true;

      const ctx = canvasElement.value.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.src = "/test-qr-image.png"; // ✅ Test image stored in public/

      img.onload = () => {
        canvasElement.value.width = img.width;
        canvasElement.value.height = img.height;

        const drawFrame = () => {
          if (!imageLoopActive) return;

          ctx.clearRect(0, 0, img.width, img.height);
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

    // ✅ Close Camera and Stop Scanning
    const closeCamera = () => {
      if (!dialog.value) return;
      dialog.value.close();
      imageLoopActive = false;
      scanningWithImage.value = false;
      
      if (codeReader) codeReader.reset();
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        stream = null;
      }
    };

    return {
      dialog,
      cameraAvailable,
      scanningWithImage,
      qrCodeData,
      selectedFile,
      videoElement,
      canvasElement,
      openCamera,
      closeCamera,
    };
  },
});
</script>

<style scoped>
.text-center {
  text-align: center;
  padding: 20px;
}

.qr-video {
  width: 100%;
  height: 400px;
  border-radius: 5px;
  border: 2px solid #ddd;
  object-fit: cover;
}

.qr-canvas {
  width: 100%;
  height: 400px;
  border-radius: 5px;
  border: 2px solid #ddd;
  object-fit: cover;
}

.qr-result {
  margin-top: 15px;
  font-weight: bold;
}
</style>
