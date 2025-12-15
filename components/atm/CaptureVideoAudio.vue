<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from "vue"
import { App } from "@capacitor/app"
import useCaptureMedia from "~/composables/atm/useCaptureMedia"

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
})

const emit = defineEmits(["capture-complete", "capture-error"])

const {
  isNative,
  initializeVideo,
  startVideoRecording,
  stopVideoRecording,
  destroyVideo,
  error: nativeError,
} = useCaptureMedia()

// Refs
const videoRef = ref(null) // Used for Web Video and Native Placeholder
const videoContainerRef = ref(null)

// Web API refs
const videoDevices = ref([])
const audioDevices = ref([])
const selectedVideoDeviceId = ref(null)
const selectedAudioDeviceId = ref(null)
const stream = ref(null)
const mediaRecorder = ref(null)
const recordedChunks = ref([])

// State
const isRecording = ref(false)
const isProcessing = ref(false)
const error = ref(null)
const remainingTime = ref(props.recordTimeLimit)
let countdownInterval = null
let resumeListener = null

const videoInputOptions = computed(() =>
  videoDevices.value.map((d) => ({
    label: d.label || "Camera",
    value: d.deviceId,
  }))
)

const audioInputOptions = computed(() =>
  audioDevices.value.map((d) => ({
    label: d.label || "Microphone",
    value: d.deviceId,
  }))
)

// Helpers
const getCaptureMetadata = (file, method) => ({
  originalFileName: file.name,
  fileSize: file.size,
  fileType: file.type,
  captureTimestamp: Date.now(),
  captureDate: new Date().toISOString(),
  captureMethod: method,
  originalProps: {
    bucket: props.bucket,
    subfolder: props.subfolder,
    patientId: props.patientId,
    metadata: props.metadata,
  },
})

// --- Methods ---

const initNativeCamera = async () => {
  if (!isNative || !videoRef.value) return

  try {
    // Wait for layout
    await nextTick()

    // Scroll into view to ensure visibility
    if (videoContainerRef.value) {
      videoContainerRef.value.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
      // Give it a moment to scroll
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    // Lock scroll to prevent "floating" feel
    document.body.style.overflow = "hidden"

    // Get position of the placeholder element
    const rect = videoRef.value.getBoundingClientRect()
    console.log("Initializing native camera at:", rect)

    await initializeVideo({
      id: "native-video-preview",
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      stackPosition: "front", // Overlay on top of the generic placeholder
    })
  } catch (err) {
    console.error("Failed to init native camera:", err)
    error.value = nativeError.value || "Failed to initialize camera"
  }
}

const startRecording = async () => {
  if (isRecording.value) return
  error.value = null

  try {
    if (isNative) {
      await startVideoRecording()
    } else {
      startWebRecording()
    }

    // UI Updates
    isRecording.value = true
    startCountdown()
  } catch (err) {
    console.error("Start recording failed:", err)
    error.value = err.message
  }
}

const stopRecording = async () => {
  if (!isRecording.value) return

  stopCountdown()
  isProcessing.value = true

  try {
    let videoFile
    if (isNative) {
      videoFile = await stopVideoRecording()
    } else {
      videoFile = await stopWebRecording()
    }

    if (videoFile) {
      // Small delay to ensure native view is fully detached/stopped before we potentially unmount
      if (isNative) await new Promise((resolve) => setTimeout(resolve, 100))

      const metadata = getCaptureMetadata(
        videoFile,
        isNative ? "native_recorder" : "web_recorder"
      )
      emit("capture-complete", { file: videoFile, metadata })
    }
  } catch (err) {
    console.error("Stop recording failed:", err)
    error.value = err.message || "Failed to stop recording"
    emit("capture-error", error.value)
  } finally {
    isRecording.value = false
    isProcessing.value = false
  }
}

const startCountdown = () => {
  remainingTime.value = props.recordTimeLimit
  clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value < 0) {
      stopRecording()
    }
  }, 1000)
}

const stopCountdown = () => {
  clearInterval(countdownInterval)
  remainingTime.value = props.recordTimeLimit
}

// --- Web Specific Methods ---

const getWebDevices = async () => {
  if (!navigator.mediaDevices?.enumerateDevices) return
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    videoDevices.value = devices.filter((d) => d.kind === "videoinput")
    audioDevices.value = devices.filter((d) => d.kind === "audioinput")

    if (videoDevices.value.length && !selectedVideoDeviceId.value)
      selectedVideoDeviceId.value = videoDevices.value[0].deviceId
    if (audioDevices.value.length && !selectedAudioDeviceId.value)
      selectedAudioDeviceId.value = audioDevices.value[0].deviceId
  } catch (err) {
    console.warn("Device enumeration failed:", err)
  }
}

const startWebCamera = async () => {
  if (stream.value) {
    stream.value.getTracks().forEach((t) => t.stop())
  }

  const constraints = {
    video: selectedVideoDeviceId.value
      ? { deviceId: { exact: selectedVideoDeviceId.value } }
      : true,
    audio: selectedAudioDeviceId.value
      ? { deviceId: { exact: selectedAudioDeviceId.value } }
      : true,
  }

  try {
    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    if (videoRef.value) videoRef.value.srcObject = stream.value
  } catch (err) {
    error.value = `Camera access failed: ${err.message}`
  }
}

const startWebRecording = () => {
  if (!stream.value) throw new Error("No stream available")

  recordedChunks.value = []
  const options = { mimeType: "video/webm" }
  // Add codec fallback logic if needed

  mediaRecorder.value = new MediaRecorder(stream.value, options)
  mediaRecorder.value.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.value.push(e.data)
  }
  mediaRecorder.value.start()
}

const stopWebRecording = () => {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder.value) return reject("No recorder")

    mediaRecorder.value.onstop = () => {
      const blob = new Blob(recordedChunks.value, { type: "video/webm" })
      const file = new File([blob], `video_${Date.now()}.webm`, {
        type: "video/webm",
      })
      resolve(file)
    }
    mediaRecorder.value.onerror = (e) => reject(e.error)

    mediaRecorder.value.stop()
  })
}

// --- Watchers & Lifecycle ---

watch([selectedVideoDeviceId, selectedAudioDeviceId], () => {
  if (!isNative) startWebCamera()
})

onMounted(async () => {
  if (isNative) {
    // Native Init
    setTimeout(initNativeCamera, 500) // Small delay for layout to settle

    // Listen for app resume (e.g. returning from permission dialog)
    resumeListener = await App.addListener("resume", async () => {
      console.log("App resumed, re-initializing camera...")
      // Give the app a moment to settle
      setTimeout(initNativeCamera, 500)
    })
  } else {
    // Web Init
    await getWebDevices()
    await startWebCamera()
  }
})

onBeforeUnmount(() => {
  stopCountdown()
  if (isNative) {
    destroyVideo()
    document.body.style.overflow = "" // Restore scroll
    if (resumeListener) {
      resumeListener.remove()
    }
  } else {
    if (stream.value) stream.value.getTracks().forEach((t) => t.stop())
  }
})

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const getPermissions = async () => {
  error.value = null
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    // effective permissions granted
    stream.getTracks().forEach((track) => track.stop())

    if (isNative) {
      await initNativeCamera()
    } else {
      await getWebDevices()
      await startWebCamera()
    }
  } catch (err) {
    console.error("Permission request failed:", err)
    error.value = `${err.message}. Please reset permissions in your browser settings.`
  }
}

defineExpose({ startRecording, stopRecording, toggleRecording })
</script>

<template>
  <div class="capture-video-audio">
    <div v-if="error || nativeError" class="error-message">
      {{ error || nativeError }}
    </div>
    <div class="actions">
      <Button v-if="error" @click="getPermissions" class="record-btn">
        Get Camera permission
      </Button>
    </div>
    <!-- Web Controls: Only show dropdowns if not native -->
    <div v-if="!isNative" class="controls flex flex-wrap grid-nogutter">
      <Select
        v-model="selectedVideoDeviceId"
        :options="videoInputOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Select Camera"
        class="text-xs w-full md:w-6"
      >
        <template #value="{ value, placeholder }">
          <span v-if="value">
            Camera:
            {{ videoInputOptions.find((opt) => opt.value === value)?.label }}
          </span>
          <span v-else>
            {{ placeholder }}
          </span>
        </template>
      </Select>
      <Select
        v-model="selectedAudioDeviceId"
        :options="audioInputOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Select Microphone"
        class="text-xs w-full md:w-6"
      >
        <template #value="{ value, placeholder }">
          <span v-if="value">
            Microphone:
            {{ audioInputOptions.find((opt) => opt.value === value)?.label }}
          </span>
          <span v-else>
            {{ placeholder }}
          </span>
        </template>
      </Select>
    </div>

    <!-- Preview Area: Shared for both Native and Web -->
    <div
      ref="videoContainerRef"
      class="preview-container"
      :style="{ aspectRatio: isNative ? '9/16' : '16/9' }"
    >
      <!-- On Native: This element gives us the rect for the native layer using 'front' stack position -->
      <!-- On Web: This plays the stream -->
      <video
        ref="videoRef"
        autoplay
        playsinline
        muted
        class="camera-preview"
      ></video>
    </div>

    <!-- Unified Actions -->
    <div class="actions">
      <Button
        @click="toggleRecording"
        :disabled="isProcessing || error"
        class="record-btn"
        :class="{ recording: isRecording }"
        :label="
          isRecording ? `Stop Recording (${remainingTime}s)` : 'Start Recording'
        "
      />
    </div>
    <div v-if="isProcessing" class="loading-indicator">Processing...</div>
  </div>
</template>

<style scoped>
.capture-video-audio {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 8px;
}

.preview-container {
  width: 100%;
  /* aspect-ratio handled dynamically in template */
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  max-height: 40vh; /* Ensure controls fit on screen */
}

.camera-preview {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  display: block;
}

.actions {
  display: flex;
  justify-content: center;
}

.record-btn {
  transition: all 0.2s;
  font-family: var(--font-family-header);
  font-weight: 700;
  width: 264px;
  position: relative;
}

.record-btn.recording {
  background: var(--p-surface-950);
  border-color: var(--p-surface-950);
  /* animation: pulse 2s infinite; */
  &:after {
    content: "";
    position: absolute;
    left: 10px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--p-primary-color);
    animation: pulse 0.5s infinite;
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

.error-message {
  color: red;
  background: #ffe0e0;
  padding: 0.5rem;
  border-radius: 4px;
}
</style>
