<template>
  <div class="camera-container">
    <!-- ✅ Button to Open Camera Dialog -->
    <v-btn color="primary" block @click="openCamera" v-if="cameraAvailable">
      Open Camera
    </v-btn>

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

    <!-- ✅ Upload Button (Enabled when an image is selected/captured) -->
    <v-btn color="success" block @click="uploadImage" :disabled="!imageFile">
      Submit Image
    </v-btn>

    <!-- ✅ Camera Dialog -->
    <v-dialog v-model="cameraDialog" max-width="600px">
      <v-card>
        <v-card-title>Camera</v-card-title>
        <v-card-text>
          <video ref="videoRef" autoplay playsinline class="camera-preview"></video>
        </v-card-text>
        <v-card-actions>
          <v-btn color="success" @click="captureImage">Capture Image</v-btn>
          <v-btn color="error" @click="closeCamera">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const API_BASE_URL = "http://localhost:5000/api/qrcode/decode"; // Your .NET API
const cameraDialog = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const cameraAvailable = ref<boolean>(false);
const selectedFile = ref<File | null>(null);
const imageFile = ref<File | null>(null);
let stream: MediaStream | null = null;

// ✅ Detect Camera Availability
onMounted(async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraAvailable.value = true; // ✅ Camera detected
    stream.getTracks().forEach((track) => track.stop()); // ✅ Stop for now
  } catch (error) {
    cameraAvailable.value = false; // ❌ No camera found, use file upload
  }
});

// ✅ Open Camera Dialog & Start Webcam
const openCamera = async () => {
  if (!cameraAvailable.value) return;
  cameraDialog.value = true;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
    }
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
};

// ✅ Capture Image from Camera
const captureImage = () => {
  if (!videoRef.value) return;

  const canvas = document.createElement("canvas");
  canvas.width = videoRef.value.videoWidth;
  canvas.height = videoRef.value.videoHeight;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        imageFile.value = new File([blob], "captured-image.png", { type: "image/png" });
        closeCamera(); // ✅ Close camera after capturing
      }
    }, "image/png");
  }
};

// ✅ Close Camera Dialog & Stop Webcam
const closeCamera = () => {
  cameraDialog.value = false;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop()); // ✅ Stop camera
    stream = null;
  }
};

// ✅ Handle Manual File Upload (Fallback)
const handleFileUpload = (event: any) => {
  if (event.target.files.length > 0) {
    imageFile.value = event.target.files[0];
  }
};

// ✅ Submit Image to API
const uploadImage = async () => {
  if (!imageFile.value) return;

  const formData = new FormData();
  formData.append("file", imageFile.value);

  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("API Response:", result);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

// ✅ Cleanup on Component Unmount
onUnmounted(() => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
});
</script>

<style scoped>
.camera-container {
  text-align: center;
  padding: 20px;
}

/* ✅ Camera Preview */
.camera-preview {
  width: 100%;
  max-width: 500px;
  border-radius: 5px;
  border: 2px solid #ddd;
  margin-bottom: 10px;
}
</style>
