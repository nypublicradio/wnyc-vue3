<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue"

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
})

const emit = defineEmits(["capture-complete", "capture-error"])

const videoRef = ref(null)
const videoDevices = ref([])
const audioDevices = ref([])
const selectedVideoDeviceId = ref(null)
const selectedAudioDeviceId = ref(null)
const stream = ref(null)
const mediaRecorder = ref(null)
const recordedChunks = ref([])
const isRecording = ref(false)
const isProcessing = ref(false)
const error = ref(null)

const supabase = useSupabaseClient()

// New captureVideo function (renamed from uploadVideo)
const captureVideo = async (videoFile) => {
  // Instead of uploading, we'll emit the captured video file
  const captureMetadata = {
    originalFileName: videoFile.name,
    fileSize: videoFile.size,
    fileType: videoFile.type,
    captureTimestamp: Date.now(),
    captureDate: new Date().toISOString(),
    captureMethod: "browser_video_audio_recorder",
    originalProps: {
      bucket: props.bucket,
      subfolder: props.subfolder,
      patientId: props.patientId,
      metadata: props.metadata,
    },
  }

  return { file: videoFile, metadata: captureMetadata }
}

const getDevices = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true }) // Request permissions
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    videoDevices.value = allDevices.filter((device) => device.kind === "videoinput")
    audioDevices.value = allDevices.filter((device) => device.kind === "audioinput")

    if (videoDevices.value.length > 0 && !selectedVideoDeviceId.value) {
      selectedVideoDeviceId.value = videoDevices.value[0].deviceId
    }
    if (audioDevices.value.length > 0 && !selectedAudioDeviceId.value) {
      selectedAudioDeviceId.value = audioDevices.value[0].deviceId
    }
  } catch (err) {
    console.error("Error enumerating devices:", err)
    error.value = `Error accessing media devices: ${err.name}. Ensure permissions are granted.`
    if (err.name === "NotAllowedError") {
      error.value =
        "Camera/microphone access was denied. Please enable permissions in your browser settings."
    } else if (err.name === "NotFoundError") {
      error.value =
        "No camera/microphone found. Please ensure they are connected and enabled."
    } else {
      error.value = `Could not access media devices: ${err.message}.`
    }
  }
}

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = null
  }
  if (videoRef.value?.srcObject) {
    videoRef.value.srcObject = null
  }
}

const startCamera = async () => {
  if (stream.value) {
    stopCamera()
  }
  if (!selectedVideoDeviceId.value && videoDevices.value.length > 0) {
    selectedVideoDeviceId.value = videoDevices.value[0].deviceId
  }
  if (!selectedAudioDeviceId.value && audioDevices.value.length > 0) {
    selectedAudioDeviceId.value = audioDevices.value[0].deviceId
  }

  if (!selectedVideoDeviceId.value && !selectedAudioDeviceId.value) {
    // Adjusted condition
    error.value = "Camera or microphone not selected or available."
    // Do not return here if one is available, try to get at least that stream
    // console.warn('Camera or microphone not selected/available.');
    // return;
  }

  const constraints = {
    video: selectedVideoDeviceId.value
      ? {
          deviceId: { exact: selectedVideoDeviceId.value },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      : false,
    audio: selectedAudioDeviceId.value
      ? { deviceId: { exact: selectedAudioDeviceId.value } }
      : false,
  }

  if (!constraints.video && !constraints.audio) {
    error.value = "No video or audio device selected."
    return
  }

  try {
    error.value = null
    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
    }
  } catch (err) {
    console.error("Error starting camera/microphone:", err)
    error.value = `Error starting devices: ${err.name}. Check permissions and device availability.`
    if (err.name === "NotAllowedError") {
      error.value = "Access denied. Please enable camera/microphone permissions."
    } else if (
      err.name === "OverconstrainedError" ||
      err.name === "ConstraintNotSatisfiedError"
    ) {
      error.value =
        "Selected device(s) do not support requested constraints. Trying defaults."
      try {
        // Fallback
        stream.value = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        if (videoRef.value) videoRef.value.srcObject = stream.value
      } catch (fallbackErr) {
        error.value = `Fallback device access failed: ${fallbackErr.message}`
      }
    } else {
      error.value = `Could not access devices: ${err.message}.`
    }
  }
}

const startRecording = () => {
  if (!stream.value) {
    error.value = "Media stream not available to start recording."
    return
  }
  if (isRecording.value) return

  error.value = null
  recordedChunks.value = []

  // Determine preferred MIME type
  const options = { mimeType: "video/webm; codecs=vp9,opus" }
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.warn(`${options.mimeType} is not supported, trying default.`)
    options.mimeType = "video/webm" // Fallback
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.warn(`${options.mimeType} is not supported either. Using browser default.`)
      delete options.mimeType // Let browser decide
    }
  }

  try {
    mediaRecorder.value = new MediaRecorder(stream.value, options)

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = async () => {
      isRecording.value = false
      isProcessing.value = true
      const blob = new Blob(recordedChunks.value, {
        type: mediaRecorder.value.mimeType || "video/webm",
      })
      const timestamp = new Date().getTime()
      const fileName = `video_${timestamp}.${
        blob.type.split("/")[1].split(";")[0] || "webm"
      }` // e.g. video_12345.webm
      const videoFile = new File([blob], fileName, { type: blob.type })

      try {
        const captureResult = await captureVideo(videoFile)
        emit("capture-complete", captureResult)
      } catch (captureErr) {
        const errorMessage =
          captureErr.message ||
          (typeof captureErr === "string" ? captureErr : "Video capture failed")
        console.error("Capture failed in onstop:", errorMessage)
        error.value = `Video capture failed: ${errorMessage}`
        emit("capture-error", errorMessage)
      } finally {
        isProcessing.value = false
        recordedChunks.value = [] // Clear chunks for next recording
      }
    }

    mediaRecorder.value.onerror = (event) => {
      console.error("MediaRecorder error:", event.error)
      error.value = `Recording error: ${event.error.name} - ${event.error.message}`
      isRecording.value = false
      isProcessing.value = false
    }

    mediaRecorder.value.start()
    isRecording.value = true
  } catch (e) {
    console.error("Failed to create MediaRecorder:", e)
    error.value = `Failed to start recording: ${e.message}. Check console for details. Ensure selected devices are working.`
    isRecording.value = false
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    // onstop handler will manage isRecording = false and processing
  }
}

onMounted(async () => {
  await getDevices()
  if (selectedVideoDeviceId.value || selectedAudioDeviceId.value) {
    // check if any device is selected
    await startCamera()
  } else if (videoDevices.value.length > 0 || audioDevices.value.length > 0) {
    // Auto-select first available devices if none are pre-selected
    if (videoDevices.value.length > 0 && !selectedVideoDeviceId.value)
      selectedVideoDeviceId.value = videoDevices.value[0].deviceId
    if (audioDevices.value.length > 0 && !selectedAudioDeviceId.value)
      selectedAudioDeviceId.value = audioDevices.value[0].deviceId
    // startCamera will be called by watchers if values changed and component is mounted
  } else {
    error.value = "No video or audio input devices found."
  }
})

onBeforeUnmount(() => {
  if (isRecording.value) {
    stopRecording()
  }
  stopCamera()
})

watch(
  [selectedVideoDeviceId, selectedAudioDeviceId],
  async (newValues, oldValues) => {
    // Check if either new video or audio device ID has actually changed and component is mounted
    if (newValues[0] !== oldValues[0] || newValues[1] !== oldValues[1]) {
      console.log("Device selection changed, restarting camera.")
      await startCamera()
    }
  },
  { immediate: false }
) // immediate: false to avoid double run on mount if getDevices sets it.

// Auto-start camera if devices become available after mount
watch(videoDevices, (newVal /* , oldVal */) => {
  // Ensure oldVal is defined for initial check if needed
  if (newVal.length > 0 && !selectedVideoDeviceId.value) {
    selectedVideoDeviceId.value = newVal[0].deviceId // Triggers camera restart via selectedVideoDeviceId watcher
  }
})
watch(audioDevices, (newVal /* , oldVal */) => {
  // Ensure oldVal is defined for initial check
  if (newVal.length > 0 && !selectedAudioDeviceId.value) {
    selectedAudioDeviceId.value = newVal[0].deviceId // Triggers camera restart via selectedAudioDeviceId watcher
  }
})
</script>

<template>
  <div class="capture-video-audio">
    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="controls">
      <div>
        <label for="video-device-select">Select Camera:</label>
        <select
          id="video-device-select"
          v-model="selectedVideoDeviceId"
          @change="startCamera"
        >
          <option
            v-for="device in videoDevices"
            :key="device.deviceId"
            :value="device.deviceId"
          >
            {{ device.label || `Camera ${videoDevices.indexOf(device) + 1}` }}
          </option>
        </select>
      </div>
      <div>
        <label for="audio-device-select">Select Microphone:</label>
        <select
          id="audio-device-select"
          v-model="selectedAudioDeviceId"
          @change="startCamera"
        >
          <option
            v-for="device in audioDevices"
            :key="device.deviceId"
            :value="device.deviceId"
          >
            {{ device.label || `Microphone ${audioDevices.indexOf(device) + 1}` }}
          </option>
        </select>
      </div>
    </div>

    <div class="preview-container">
      <video ref="videoRef" autoplay playsinline muted class="camera-preview"></video>
    </div>

    <div class="actions">
      <button @click="startRecording" :disabled="isRecording || !stream">
        Start Recording
      </button>
      <button @click="stopRecording" :disabled="!isRecording">Stop Recording</button>
    </div>

    <div v-if="isProcessing" class="loading-indicator">
      Processing video capture...
    </div>
  </div>
</template>

<style scoped>
.capture-video-audio {
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
  gap: 1rem;
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
  /* Start Recording */
  background-color: #28a745;
  /* Green */
}

.actions button:nth-child(1):disabled {
  background-color: #8fbc8f;
}

.actions button:nth-child(2) {
  /* Stop Recording */
  background-color: #dc3545;
  /* Red */
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
</style>
