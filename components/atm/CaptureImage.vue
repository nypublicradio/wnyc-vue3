<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import useCaptureMedia from "~/composables/atm/useCaptureMedia";

const props = defineProps({
  bucket: {
    type: String,
    default: "media",
  },
  subfolder: {
    type: String,
    default: null,
  },
  patientId: {
    type: String,
    default: "",
  },
  metadata: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["capture-complete", "capture-error"]);

const { isNative, captureImage: captureImageNative, error: nativeError } = useCaptureMedia();

// Web API refs (only used in browser)
const videoRef = ref(null);
const canvasRef = ref(null);
const devices = ref([]);
const selectedDeviceId = ref(null);
const stream = ref(null);
const error = ref(null);
const isProcessing = ref(null);

// Native capture handler
const handleNativeCapture = async () => {
  try {
    isProcessing.value = true;
    error.value = null;

    const imageFile = await captureImageNative();

    const captureMetadata = {
      captureMethod: "native_camera",
      captureTimestamp: Date.now(),
      captureDate: new Date().toISOString(),
      originalProps: {
        bucket: props.bucket,
        subfolder: props.subfolder,
        patientId: props.patientId,
        metadata: props.metadata,
      },
    };

    emit("capture-complete", {
      file: imageFile,
      metadata: captureMetadata,
    });
  } catch (err) {
    error.value = err.message || "Native image capture failed";
    emit("capture-error", error.value);
  } finally {
    isProcessing.value = false;
  }
};

// Web API handlers (browser only)
const captureImage = () => {
  if (!videoRef.value || !canvasRef.value || !stream.value) {
    error.value = "Camera stream not available for capture.";
    return;
  }
  isProcessing.value = true;
  error.value = null;

  const video = videoRef.value;
  const canvas = canvasRef.value;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(
    async (blob) => {
      if (!blob) {
        error.value = "Failed to create image blob.";
        isProcessing.value = false;
        return;
      }
      const timestamp = new Date().getTime();
      const fileName = `capture_${timestamp}.jpg`;
      const imageFile = new File([blob], fileName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      try {
        const captureMetadata = {
          captureMethod: "browser_camera",
          captureTimestamp: timestamp,
          captureDate: new Date().toISOString(),
          originalProps: {
            bucket: props.bucket,
            subfolder: props.subfolder,
            patientId: props.patientId,
            metadata: props.metadata,
          },
        };

        emit("capture-complete", {
          file: imageFile,
          metadata: captureMetadata,
        });
      } catch (error) {
        const errorMessage = error.message || "Image capture failed";
        console.error("Capture failed:", errorMessage);
        error.value = `Capture failed: ${errorMessage}`;
        emit("capture-error", errorMessage);
      } finally {
        isProcessing.value = false;
      }
    },
    "image/jpeg",
    0.9
  );
};

const getDevices = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      error.value = "Media devices API not available. Please use a supported browser.";
      console.error("navigator.mediaDevices.getUserMedia is not available");
      return;
    }

    let allDevices = await navigator.mediaDevices.enumerateDevices();
    const hasLabels = allDevices.some(device => device.label !== '');
    
    if (!hasLabels) {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        allDevices = await navigator.mediaDevices.enumerateDevices();
      } catch (permErr) {
        console.warn("Permission request failed, continuing with unlabeled devices:", permErr);
      }
    }

    devices.value = allDevices.filter((device) => device.kind === "videoinput");
    if (devices.value.length > 0 && !selectedDeviceId.value) {
      selectedDeviceId.value = devices.value[0].deviceId;
    }
  } catch (err) {
    console.error("Error enumerating devices:", err);
    error.value = `Error accessing media devices: ${err.name}. Please ensure permissions are granted.`;
  }
};

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
    stream.value = null;
  }
  if (videoRef.value?.srcObject) {
    videoRef.value.srcObject = null;
  }
};

const startCamera = async () => {
  if (stream.value) {
    stopCamera();
  }
  if (!selectedDeviceId.value && devices.value.length > 0) {
    selectedDeviceId.value = devices.value[0].deviceId;
  }
  if (!selectedDeviceId.value) {
    error.value = "No camera selected or available.";
    console.warn("No camera selected or available to start.");
    return;
  }

  const constraints = {
    video: {
      deviceId: { exact: selectedDeviceId.value },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  };

  try {
    error.value = null;
    stream.value = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value;
      videoRef.value.onloadedmetadata = () => {
        if (canvasRef.value) {
          canvasRef.value.width = videoRef.value.videoWidth;
          canvasRef.value.height = videoRef.value.videoHeight;
        }
      };
    }
  } catch (err) {
    console.error("Error starting camera:", err);
    error.value = `Error starting camera: ${err.name}. Check permissions and device availability.`;
  }
};

onMounted(async () => {
  // Only initialize web APIs if in browser
  if (!isNative) {
    await getDevices();
    if (selectedDeviceId.value) {
      await startCamera();
    } else if (devices.value.length > 0) {
      selectedDeviceId.value = devices.value[0].deviceId;
    } else {
      error.value = "No video input devices found. Please connect a camera.";
    }
  }
});

onBeforeUnmount(() => {
  stopCamera();
});

watch(selectedDeviceId, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal && !isNative) {
    await startCamera();
  }
});

watch(devices, (newDevices) => {
  if (newDevices.length > 0 && !selectedDeviceId.value && !isNative) {
    selectedDeviceId.value = newDevices[0].deviceId;
  }
});
</script>

<template>
  <div class="capture-image">
    <div v-if="error || nativeError" class="error-message">{{ error || nativeError }}</div>

    <!-- Native platform: Simple button to open native camera -->
    <div v-if="isNative">
      <div class="actions">
        <button @click="handleNativeCapture" :disabled="isProcessing">
          {{ isProcessing ? 'Processing...' : 'Take Photo' }}
        </button>
      </div>
    </div>

    <!-- Browser platform: Full web API controls -->
    <div v-else>
      <div class="controls">
        <select
          id="camera-select"
          v-model="selectedDeviceId"
          @change="startCamera"
          class="w-full"
        >
          <option
            v-for="device in devices"
            :key="device.deviceId"
            :value="device.deviceId"
            class="w-full"
          >
            {{ device.label || `Camera ${devices.indexOf(device) + 1}` }}
          </option>
        </select>
      </div>

      <div class="preview-container">
        <video
          ref="videoRef"
          autoplay
          playsinline
          muted
          class="camera-preview"
        ></video>
        <canvas ref="canvasRef" style="display: none"></canvas>
      </div>

      <div class="actions">
        <button @click="captureImage" :disabled="!stream">Capture Image</button>
      </div>
    </div>

    <div v-if="isProcessing" class="loading-indicator">
      Processing capture...
    </div>
  </div>
</template>

<style scoped>
.capture-image {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
}

.controls label {
  font-weight: bold;
}

.controls select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.preview-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.camera-preview {
  width: 100%;
  height: auto;
  border-radius: 4px;
  background-color: #333;
  display: block;
}

.actions {
  display: flex;
  justify-content: center;
}

.actions button {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.actions button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.error-message {
  color: red;
  background-color: #ffe0e0;
  border: 1px solid red;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.loading-indicator {
  text-align: center;
  padding: 1rem;
  font-style: italic;
}
</style>
