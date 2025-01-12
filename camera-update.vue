<template>
  <div class="camera-container">
    <!-- ✅ Button to Open Camera Dialog -->
    <v-btn color="primary" block @click="openCamera"> Open Camera </v-btn>

    <!-- ✅ Display Captured Image Below Button -->
    <img
      v-if="capturedImage"
      :src="capturedImage"
      class="captured-image"
      alt="Captured Image"
    />

    <!-- ✅ Camera Dialog -->
    <v-dialog v-model="cameraDialog" max-width="600px">
      <v-card>
        <v-card-title>Camera</v-card-title>
        <v-card-text>
          <!-- ✅ Live Camera Feed -->
          <video
            ref="videoRef"
            autoplay
            playsinline
            class="camera-preview"
          ></video>
        </v-card-text>

        <v-card-actions>
          <!-- ✅ Capture Button -->
          <v-btn color="success" @click="captureImage">Capture Image</v-btn>
          <!-- ✅ Close Camera Dialog -->
          <v-btn color="error" @click="closeCamera">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue";

  const cameraDialog = ref(false); // ✅ Controls camera dialog visibility
  const videoRef = ref<HTMLVideoElement | null>(null);
  const capturedImage = ref<string | null>(null);
  let stream: MediaStream | null = null;

  // ✅ Open Camera Dialog and Start Webcam
  const openCamera = async () => {
    cameraDialog.value = true;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // ✅ Uses rear camera on iOS
      });
      if (videoRef.value) {
        videoRef.value.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // ✅ Capture Image from Camera Feed
  const captureImage = () => {
    const video = videoRef.value;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      capturedImage.value = canvas.toDataURL("image/png"); // ✅ Save as Base64 image
    }
  };

  // ✅ Close Camera Dialog and Stop Webcam
  const closeCamera = () => {
    cameraDialog.value = false;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); // ✅ Stop camera feed
      stream = null;
    }
  };

  // ✅ Cleanup when component is destroyed
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

  /* ✅ Captured Image */
  .captured-image {
    width: 100%;
    max-width: 500px;
    margin-top: 10px;
    border-radius: 5px;
    border: 2px solid #ddd;
  }
</style>
