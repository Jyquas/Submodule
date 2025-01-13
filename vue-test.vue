<template>
  <div class="qr-scanner-container">
    <p v-if="scanning">🔍 Scanning for QR Code...</p>

    <!-- ✅ QR Scanner Component -->
    <barcode-qrcode-reader
      v-if="cameraAvailable && scanning"
      @detect="onQRCodeDetected"
      :formats="['qr_code']"
      :camera="cameraFacing"
    />

    <!-- ✅ File Input for Manual Upload (Fallback) -->
    <v-file-input
      v-if="!cameraAvailable"
      v-model="selectedFile"
      label="Upload an Image"
      accept="image/*"
      show-size
      clearable
      @change="handleFileUpload"
    />

    <!-- ✅ Start Scanning Button -->
    <v-btn color="primary" block v-if="!scanning && cameraAvailable" @click="startScanning">
      Start Scanning
    </v-btn>

    <!-- ✅ Show QR Code Data -->
    <v-alert v-if="qrCodeData" type="success" class="qr-result">
      QR Code Detected: {{ qrCodeData }}
    </v-alert>

    <!-- ✅ Upload Button (Only shows when QR data exists) -->
    <v-btn
      color="success"
      block
      v-if="qrCodeData"
      @click="uploadQRData"
    >
      Upload QR Data
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { BarcodeQrcodeReader } from "vue3-barcode-qrcode-reader";

const cameraAvailable = ref<boolean>(false);
const scanning = ref<boolean>(false);
const qrCodeData = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const cameraFacing = ref<string>("environment"); // Use rear camera

// ✅ Check if Camera is Available
onMounted(async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true });
    cameraAvailable.value = true;
  } catch (error) {
    console.warn("No camera detected, using file upload fallback.");
    cameraAvailable.value = false;
  }
});

// ✅ Start QR Scanning
const startScanning = () => {
  if (!cameraAvailable.value) return;
  scanning.value = true;
};

// ✅ Handle QR Code Detection Locally
const onQRCodeDetected = (result: string) => {
  console.log("QR Code Detected:", result);
  qrCodeData.value = result;
  scanning.value = false; // Stop scanning after detection
};

// ✅ Handle Manual File Upload (Fallback)
const handleFileUpload = (event: any) => {
  if (event.target.files.length > 0) {
    const file = event.target.files[0];
    readQRCodeFromImage(file);
  }
};

// ✅ Read QR Code From Uploaded Image (Fully Local)
const readQRCodeFromImage = async (file: File) => {
  const image = new Image();
  image.src = URL.createObjectURL(file);

  image.onload = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(image, 0, 0);
      const barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });

      try {
        const barcodes = await barcodeDetector.detect(canvas);
        if (barcodes.length > 0) {
          qrCodeData.value = barcodes[0].rawValue;
        } else {
          console.warn("No QR Code found in image.");
        }
      } catch (error) {
        console.error("Error reading QR Code:", error);
      }
    }
  };
};

// ✅ Handle Upload (Stores Data Locally or Sends to Backend)
const uploadQRData = () => {
  console.log("Uploading QR Data:", qrCodeData.value);
  // 🚀 Add logic here for storing/sending the data as needed.
};
</script>

<style scoped>
.qr-scanner-container {
  text-align: center;
  padding: 20px;
}

/* ✅ QR Code Result Display */
.qr-result {
  margin-top: 15px;
  font-weight: bold;
}
</style>
