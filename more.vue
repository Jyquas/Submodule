<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  DocumentReaderApi,
  GraphicFieldType,
  Configuration,
  Scenario,
  defineComponents,
  DocumentReaderService,
} from '@regulaforensics/vp-frontend-document-components';

// Initialize Regula Document Reader API
const API_BASE_PATH = 'https://nightly-api.regulaforensics.com';
const configuration = new Configuration({ basePath: API_BASE_PATH });
const api = new DocumentReaderApi(configuration);

const containerRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const hasCamera = ref(false);
const resultMessage = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

// Initialize the Document Reader SDK
const RegulaDocumentSDK = new DocumentReaderService();
RegulaDocumentSDK.recognizerProcessParam = {
  processParam: {
    scenario: 'MrzAndLocate',
    multipageProcessing: true,
  },
};
RegulaDocumentSDK.imageProcessParam = {
  processParam: {
    scenario: 'MrzAndLocate',
  },
};

// Define the web components
defineComponents().then(() => RegulaDocumentSDK.initialize());

// Function to check for camera availability
const checkCameraAvailability = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    hasCamera.value = devices.some((device) => device.kind === 'videoinput');
  } catch (error) {
    console.error("Error checking camera:", error);
    hasCamera.value = false;
  }
};

// Open document reader if a camera is available
const openDocumentReader = () => {
  if (hasCamera.value) {
    isOpen.value = true;
  } else {
    alert("No camera found, please upload an image.");
  }
};

// Listener for document reader events
const documentReaderListener = async (event: CustomEvent) => {
  if (event.detail.action === 'PROCESS_FINISHED') {
    const status = event.detail.data?.status;
    if (status !== 1 && status !== 2) return;

    // Extract document front image
    const componentResponse = event.detail.data.response;
    const imageField = componentResponse.images.getField(GraphicFieldType.DOCUMENT_FRONT);
    const documentFront = imageField.valueList[1].value;

    // Send image to API for QR extraction
    await processImage(imageField.valueList[1].value);
  }

  if (event.detail?.action === 'CLOSE') {
    isOpen.value = false;
  }
};

// Handle file selection and convert to Base64
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        console.log("Uploaded Image Base64:", reader.result);
        await processImage(reader.result);
      }
    };
    reader.readAsDataURL(selectedFile.value);
  }
};

// Send image to API for QR data extraction
const processImage = async (imageBase64: string) => {
  try {
    const response = await fetch("https://your-api.com/decode-qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      throw new Error("Failed to extract QR data");
    }

    const data = await response.json();
    console.log("QR Code Data:", data);
    resultMessage.value = `Extracted QR Code: ${data.qrCode}`;
  } catch (error) {
    console.error("Error extracting QR data:", error);
    resultMessage.value = 'Error extracting QR data.';
  }
};

onMounted(async () => {
  await checkCameraAvailability();

  if (containerRef.value) {
    containerRef.value.addEventListener('document-reader', documentReaderListener as EventListener);
  }
});

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('document-reader', documentReaderListener as EventListener);
  }
});
</script>

<template>
  <div ref="containerRef" style="text-align: center; padding: 20px;">
    <!-- Camera Available -->
    <button v-if="hasCamera && !isOpen" @click="openDocumentReader" style="padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer;">
      Open Document Reader
    </button>

    <!-- Document Reader Component -->
    <document-reader v-if="isOpen"></document-reader>

    <!-- Upload Section (Only if no camera) -->
    <div v-if="!hasCamera" style="margin-top: 20px;">
      <input type="file" accept="image/*" @change="handleFileUpload" />
      <p v-if="selectedFile">Selected file: {{ selectedFile.name }}</p>
    </div>

    <!-- Show Extracted QR Code -->
    <p v-if="resultMessage" style="margin-top: 20px; color: green;">
      {{ resultMessage }}
    </p>
  </div>
</template>
