<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import {
  DocumentReaderApi,
  GraphicFieldType,
  Configuration,
  Scenario,
  defineComponents,
  DocumentReaderService,
} from '@regulaforensics/vp-frontend-document-components';

export default defineComponent({
  name: "DocumentReaderComponent",
  emits: ["reference-id-found"], // ✅ Declare event that emits referenceId
  setup(_, { emit }) {
    const API_BASE_PATH = 'https://nightly-api.regulaforensics.com';
    const configuration = new Configuration({ basePath: API_BASE_PATH });
    const api = new DocumentReaderApi(configuration);

    const containerRef = ref<HTMLElement | null>(null);
    const isOpen = ref(false);
    const hasCamera = ref(false);
    const resultMessage = ref<string | null>(null);
    const selectedFile = ref<File | null>(null);

    // ✅ Initialize Regula Document Reader SDK
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

    defineComponents().then(() => RegulaDocumentSDK.initialize());

    // ✅ Check for camera availability
    const checkCameraAvailability = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        hasCamera.value = devices.some((device) => device.kind === 'videoinput');
      } catch (error) {
        console.error("Error checking camera:", error);
        hasCamera.value = false;
      }
    };

    // ✅ Open document reader
    const openDocumentReader = () => {
      if (hasCamera.value) {
        isOpen.value = true;
      } else {
        alert("No camera found, please upload an image.");
      }
    };

    // ✅ Document Reader Event Listener
    const documentReaderListener = async (event: CustomEvent) => {
      if (event.detail.action === 'PROCESS_FINISHED') {
        const status = event.detail.data?.status;
        if (status !== 1 && status !== 2) return;

        // Extract document front image
        const componentResponse = event.detail.data.response;
        const imageField = componentResponse.images.getField(GraphicFieldType.DOCUMENT_FRONT);
        const documentFront = imageField.valueList[1].value;

        // Send image to Regula API for text extraction
        await processImageWithRegula(documentFront);
      }

      if (event.detail?.action === 'CLOSE') {
        isOpen.value = false;
      }
    };

    // ✅ Handle file upload
    const handleFileUpload = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        selectedFile.value = input.files[0];

        const reader = new FileReader();
        reader.onload = async () => {
          if (typeof reader.result === "string") {
            console.log("Uploaded Image Base64:", reader.result);
            await processImageWithRegula(reader.result);
          }
        };
        reader.readAsDataURL(selectedFile.value);
      }
    };

    // ✅ Send image to Regula API and extract JSON & referenceId
    const processImageWithRegula = async (imageBase64: string) => {
      try {
        const processParam = {
          images: [imageBase64],
          processParam: {
            scenario: Scenario.FULL_PROCESS,
          },
        };

        // ✅ Send request to Regula's API
        const response = await api.process(processParam);

        // ✅ Extract the first field (assumes JSON data)
        const firstField = response.text?.fields?.[0]?.valueList?.[0]?.value;

        if (!firstField) {
          resultMessage.value = "No text data found.";
          return;
        }

        let parsedJson;
        let referenceId;

        try {
          parsedJson = JSON.parse(firstField); // Try to parse the JSON
          referenceId = parsedJson.referenceId || null; // Extract referenceId
        } catch (error) {
          resultMessage.value = "Invalid JSON data received.";
          return;
        }

        // ✅ Emit event with referenceId so the parent can use it
        if (referenceId) {
          console.log("Emitting referenceId:", referenceId);
          emit("reference-id-found", referenceId);
        }

        // ✅ Display in the UI
        resultMessage.value = `Reference ID: ${referenceId}\nExtracted Data: ${JSON.stringify(parsedJson, null, 2)}`;

      } catch (error) {
        console.error("Error extracting text data from Regula:", error);
        resultMessage.value = 'Error extracting text data.';
      }
    };

    // ✅ Lifecycle Hooks
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

    return {
      containerRef,
      isOpen,
      hasCamera,
      resultMessage,
      selectedFile,
      openDocumentReader,
      handleFileUpload,
    };
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
    <p v-if="resultMessage" style="margin-top: 20px; color: green; white-space: pre-line;">
      {{ resultMessage }}
    </p>
  </div>
</template>
