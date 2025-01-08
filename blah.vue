<template>
  <div ref="containerRef" class="container">
    <!-- Camera Available -->
    <v-btn v-if="hasCamera && !isOpen" @click="openDocumentReader" color="primary" block>
      Open Document Reader
    </v-btn>

    <!-- Document Reader Component -->
    <document-reader v-if="isOpen"></document-reader>

    <!-- Upload Section (Only if no camera) -->
    <div v-if="!hasCamera" class="file-upload-container">
      <label class="file-upload-label">
        <input type="file" accept="image/*" @change="handleFileUpload" class="file-input" />
        <v-btn color="primary" block>Choose File</v-btn>
      </label>
      <p v-if="selectedFile" class="file-name">Selected: {{ selectedFile.name }}</p>
    </div>

    <!-- Show Extracted QR Code -->
    <p v-if="resultMessage" class="result-message">
      {{ resultMessage }}
    </p>
  </div>
</template>

<style scoped>
/* ✅ Container Styling */
.container {
  text-align: center;
  padding: 20px;
}

/* ✅ File Upload Styling */
.file-upload-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* Hide default file input */
.file-input {
  display: none;
}

/* ✅ Selected file name styling */
.file-name {
  margin-top: 10px;
  font-size: 14px;
  color: #333;
  font-weight: bold;
}

/* ✅ Styling for extracted reference ID */
.result-message {
  margin-top: 20px;
  color: green;
  font-weight: bold;
  white-space: pre-line;
}
</style>
