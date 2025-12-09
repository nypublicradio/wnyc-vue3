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
  recordTimeLimit: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["capture-complete", "capture-error"]);

const { isNative, captureAudio: captureAudioNative, error: nativeError } = useCaptureMedia();

// Web API refs (only used in browser)
const audioDevices = ref([]);
const selectedAudioDeviceId = ref(null);
const stream = ref(null);
const mediaRecorder = ref(null);
const recordedChunks = ref([]);
const isRecording = ref(false);
const isProcessing = ref(false);
const error = ref(null);
const audioUrl = ref(null);

const supabase = useSupabaseClient();

// Native capture handler
const handleNativeCapture = async () => {
  try {
    isProcessing.value = true;
    error.value = null;

    const audioFile = await captureAudioNative({
      duration: props.recordTimeLimit
    });

    const captureMetadata = {
      originalFileName: audioFile.name,
      fileSize: audioFile.size,
      fileType: audioFile.type,
      captureTimestamp: Date.now(),
      captureDate: new Date().toISOString(),
      captureMethod: "native_audio_recorder",
      originalProps: {
        bucket: props.bucket,
        subfolder: props.subfolder,
        patientId: props.patientId,
        metadata: props.metadata,
      },
    };

    emit("capture-complete", { file: audioFile, metadata: captureMetadata });
  } catch (err) {
    error.value = err.message || "Native audio capture failed";
    emit("capture-error", error.value);
  } finally {
    isProcessing.value = false;
  }
};

// Web API handlers (browser only)
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
        await navigator.mediaDevices.getUserMedia({ audio: true });
        allDevices = await navigator.mediaDevices.enumerateDevices();
      } catch (permErr) {
        console.warn("Permission request failed, continuing with unlabeled devices:", permErr);
      }
    }

    audioDevices.value = allDevices.filter(
      (device) => device.kind === "audioinput"
    );

    if (audioDevices.value.length > 0 && !selectedAudioDeviceId.value) {
      selectedAudioDeviceId.value = audioDevices.value[0].deviceId;
    }
  } catch (err) {
    console.error("Error enumerating audio devices:", err);
    error.value = `Error accessing audio devices: ${err.name}. Ensure permissions are granted.`;
  }
};

const stopMedia = () => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
    stream.value = null;
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = null;
  }
};

const initializeMedia = async () => {
  if (stream.value) {
    stopMedia();
  }
  if (!selectedAudioDeviceId.value && audioDevices.value.length > 0) {
    selectedAudioDeviceId.value = audioDevices.value[0].deviceId;
  }

  if (!selectedAudioDeviceId.value) {
    error.value = "Microphone not selected or available.";
    return;
  }

  const constraints = {
    audio: selectedAudioDeviceId.value
      ? { deviceId: { exact: selectedAudioDeviceId.value } }
      : true,
    video: false,
  };

  try {
    error.value = null;
    stream.value = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    console.error("Error starting microphone:", err);
    error.value = `Error starting microphone: ${err.name}. Check permissions and device availability.`;
  }
};

const uploadAudio = async (audioFile) => {
  const captureMetadata = {
    originalFileName: audioFile.name,
    fileSize: audioFile.size,
    fileType: audioFile.type,
    captureTimestamp: Date.now(),
    captureDate: new Date().toISOString(),
    captureMethod: "browser_audio_recorder",
    originalProps: {
      bucket: props.bucket,
      subfolder: props.subfolder,
      patientId: props.patientId,
      metadata: props.metadata,
    },
  };

  return { file: audioFile, metadata: captureMetadata };
};

const startRecording = () => {
  if (!stream.value) {
    error.value = "Audio stream not available to start recording.";
    return;
  }
  if (isRecording.value) return;

  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = null;
  }
  recordedChunks.value = [];

  let selectedMimeType = "";
  const mimeTypesToTry = [
    "audio/webm; codecs=opus",
    "audio/webm",
    "audio/ogg; codecs=opus",
    "audio/ogg",
  ];

  for (const mime of mimeTypesToTry) {
    if (MediaRecorder.isTypeSupported(mime)) {
      selectedMimeType = mime;
      break;
    }
  }

  if (!selectedMimeType) {
    error.value =
      "Your browser does not support common WebM/Ogg Opus audio recording. Using browser default, which may fail to upload.";
    console.warn(
      "Preferred WebM/Ogg Opus mime types not supported. MediaRecorder will use browser default."
    );
  } else {
    error.value = null;
  }

  const options = selectedMimeType ? { mimeType: selectedMimeType } : {};

  try {
    mediaRecorder.value = new MediaRecorder(stream.value, options);

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.value.push(event.data);
    };

    mediaRecorder.value.onstop = async () => {
      isRecording.value = false;
      isProcessing.value = true;

      const blobMimeType = mediaRecorder.value.mimeType || "audio/webm";
      const blob = new Blob(recordedChunks.value, { type: blobMimeType });
      const timestamp = new Date().getTime();

      let fileExtension = "webm";
      if (blobMimeType.includes("ogg")) fileExtension = "ogg";
      else if (blobMimeType.includes("mp4")) fileExtension = "mp4";

      const fileName = `audio_${timestamp}.${fileExtension}`;
      const audioFile = new File([blob], fileName, { type: blobMimeType });

      audioUrl.value = URL.createObjectURL(blob);

      try {
        const captureResult = await uploadAudio(audioFile);
        emit("capture-complete", captureResult);
      } catch (captureErr) {
        const errorMessage =
          captureErr.message ||
          (typeof captureErr === "string"
            ? captureErr
            : "Audio capture failed");
        error.value = `Audio capture failed: ${errorMessage} (Format: ${blobMimeType})`;
        emit("capture-error", errorMessage);
      } finally {
        isProcessing.value = false;
        recordedChunks.value = [];
      }
    };

    mediaRecorder.value.onerror = (event) => {
      console.error("MediaRecorder error:", event.error);
      error.value = `Recording error: ${event.error.name} - ${event.error.message}`;
      isRecording.value = false;
      isProcessing.value = false;
    };

    mediaRecorder.value.start();
    isRecording.value = true;
  } catch (e) {
    console.error("Failed to create MediaRecorder for audio:", e);
    error.value = `Failed to start audio recording: ${e.message}. Your browser might not support the selected audio format.`;
    isRecording.value = false;
    return;
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
  }
};

onMounted(async () => {
  // Only initialize web APIs if in browser
  if (!isNative) {
    await getDevices();
    if (selectedAudioDeviceId.value) {
      await initializeMedia();
    } else if (audioDevices.value.length > 0) {
      selectedAudioDeviceId.value = audioDevices.value[0].deviceId;
    } else if (!error.value) {
      error.value = "No audio input devices found.";
    }
  }
});

onBeforeUnmount(() => {
  if (isRecording.value) stopRecording();
  stopMedia();
});

watch(selectedAudioDeviceId, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal && !isNative) {
    await initializeMedia();
  }
});

watch(audioDevices, (newVal) => {
  if (newVal.length > 0 && !selectedAudioDeviceId.value && !isNative) {
    selectedAudioDeviceId.value = newVal[0].deviceId;
  }
});

defineExpose({
  startRecording,
  stopRecording,
});
</script>

<template>
  <div class="capture-audio">
    <div v-if="error || nativeError" class="error-message">{{ error || nativeError }}</div>

    <!-- Native platform: Simple button to open native recorder -->
    <div v-if="isNative">
      <div class="actions">
        <button @click="handleNativeCapture" :disabled="isProcessing">
          {{ isProcessing ? 'Processing...' : 'Record Audio' }}
        </button>
      </div>
    </div>

    <!-- Browser platform: Full web API controls -->
    <div v-else>
      <div class="controls">
        <div>
          <label for="audio-device-select">Select Microphone:</label>
          <select
            id="audio-device-select"
            v-model="selectedAudioDeviceId"
            @change="initializeMedia"
          >
            <option
              v-for="device in audioDevices"
              :key="device.deviceId"
              :value="device.deviceId"
            >
              {{
                device.label || `Microphone ${audioDevices.indexOf(device) + 1}`
              }}
            </option>
          </select>
        </div>
      </div>

      <div class="actions">
        <button @click="startRecording" :disabled="isRecording || !stream">
          Start Recording Audio
        </button>
        <button @click="stopRecording" :disabled="!isRecording">
          Stop Recording Audio
        </button>
      </div>

      <div
        v-if="audioUrl && !isRecording && !isProcessing"
        class="audio-playback"
      >
        <p>Recording complete. Preview:</p>
        <audio :src="audioUrl" controls></audio>
      </div>
    </div>

    <div v-if="isProcessing" class="loading-indicator">
      Processing audio capture...
    </div>
  </div>
</template>

<style scoped>
.capture-audio {
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
  flex-wrap: wrap;
  gap: 1rem;
}

.controls > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.controls label {
  font-weight: bold;
  font-size: 0.9em;
}

.controls select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.actions button {
  padding: 0.75rem 1.5rem;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.actions button:nth-child(1) {
  background-color: #28a745;
}

.actions button:nth-child(1):disabled {
  background-color: #8fbc8f;
}

.actions button:nth-child(2) {
  background-color: #dc3545;
}

.actions button:nth-child(2):disabled {
  background-color: #f08080;
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

.audio-playback {
  margin-top: 1rem;
  text-align: center;
}

.audio-playback p {
  margin-bottom: 0.5rem;
}

.audio-playback audio {
  width: 100%;
  max-width: 400px;
}
</style>
