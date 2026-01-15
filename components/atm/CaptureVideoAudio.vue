<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from "vue"
import { App } from "@capacitor/app"
import { Capacitor } from "@capacitor/core"
import useCaptureMedia from "~/composables/atm/useCaptureMedia"
import { trackClickEvent, toSystemSettings } from "~/utilities/helpers"
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

const emit = defineEmits(["capture-complete", "capture-error", "close-capture"])

const {
  isNative,
  initializeVideo,
  startVideoRecording,
  stopVideoRecording,
  destroyVideo,
  error: nativeError,
  requestPermissions,
} = useCaptureMedia()

// Refs
const videoRef = ref(null) // Used for Web Video and Native Placeholder
const videoContainerRef = ref(null)
const initTimer = ref(null)
const isCameraInitialized = ref(false)

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

// stop time limit countdown handler
const stopCountdown = () => {
  clearInterval(countdownInterval)
  remainingTime.value = props.recordTimeLimit
}

// init native camera handler & scroll into view & lock scroll
// init native camera handler & scroll into view & lock scroll
const isInitializing = ref(false)
const initNativeCamera = async () => {
  if (
    !isNative ||
    !videoRef.value ||
    isInitializing.value ||
    isCameraInitialized.value
  ) {
    return
  }

  isInitializing.value = true
  try {
    // 1. Request Permissions FIRST (This will block/pause if dialog appears)
    await requestPermissions()

    // 2. Wait for layout to settle/restore after any potential app switching/dialogs
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 300)) // Small breathing room for UI restoration

    // 3. Scroll into view to ensure visibility (now that we hold permissions)
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

    // 4. NOW measure the DOM element. The layout should be stable.
    if (!videoRef.value) return
    const rect = videoRef.value.getBoundingClientRect()

    // 5. Initialize the video recorder with the correct coordinates
    await initializeVideo({
      id: "native-video-preview",
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      stackPosition: "front", // Overlay on top of the generic placeholder
    })
    isCameraInitialized.value = true
  } catch (err) {
    error.value =
      nativeError.value ||
      (err instanceof Error ? err.message : String(err)) ||
      "Failed to initialize camera"
  } finally {
    isInitializing.value = false
  }
}
// stop web recording handler
const stopWebRecording = () => {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder.value) return reject(new Error("No recorder"))

    mediaRecorder.value.onstop = () => {
      const blob = new Blob(recordedChunks.value, { type: "video/webm" })
      const file = new File([blob], `video_${Date.now()}.webm`, {
        type: "video/webm",
      })
      resolve(file)
    }
    mediaRecorder.value.onerror = (e) => reject(e.error)

    mediaRecorder.value.stop()
    return null
  })
}
// stop recording handler
const stopRecording = async () => {
  if (!isRecording.value) return

  stopCountdown()
  isProcessing.value = true
  let videoFile = null
  try {
    if (isNative) {
      videoFile = await stopVideoRecording()
    } else {
      videoFile = await stopWebRecording()
    }

    if (videoFile) {
      if (isNative) {
        // ios only - explicit destroy to clean up native view immediately
        if (Capacitor.getPlatform() === "ios") {
          await destroyVideo()
          isCameraInitialized.value = false
        }
        // Small delay to ensure native view is fully detached/stopped
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

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
    // Restore scroll if we destroyed the camera
    if (isNative && !isCameraInitialized.value) {
      document.body.style.overflow = ""
    }
  }
}
// start time limit countdown handler
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
// start web recording handler
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
// start recording handler
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
// start web camera handler
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

// --- Watchers & Lifecycle ---

watch([selectedVideoDeviceId, selectedAudioDeviceId], () => {
  if (!isNative) startWebCamera()
})

onMounted(async () => {
  if (isNative) {
    // Native Init
    // No need for resume listener logic anymore since we explicitly await permissions inside initNativeCamera
    initTimer.value = setTimeout(initNativeCamera, 500)
  } else {
    // Web Init
    await getWebDevices()
    await startWebCamera()
  }
})

onBeforeUnmount(() => {
  stopCountdown()
  if (isNative) {
    if (initTimer.value) clearTimeout(initTimer.value)

    // Only destroy if we actually initialized (prevents NPE crash in plugin)
    if (isCameraInitialized.value) {
      destroyVideo()
    }
    document.body.style.overflow = "" // Restore scroll
  } else {
    if (stream.value) stream.value.getTracks().forEach((t) => t.stop())
  }
})
// toggle recording handler and track events
const toggleRecording = () => {
  if (isRecording.value) {
    trackClickEvent(
      "Click Tracking - Stop Recording",
      "Video Capture",
      "Stop Recording"
    )
    stopRecording()
  } else {
    trackClickEvent(
      "Click Tracking - Start Recording",
      "Video Capture",
      "Start Recording"
    )
    startRecording()
  }
}

defineExpose({ startRecording, stopRecording, toggleRecording })
</script>

<template>
  <div class="capture-video-audio">
    <div v-if="error || nativeError" class="error-message">
      We can't access your camera or microphone. Please reset permissions in
      your device settings.
    </div>
    <div v-if="nativeError && isNative" class="actions">
      <Button @click="() => toSystemSettings('base')" class="record-btn">
        Application Settings
      </Button>
    </div>
    <!-- Web Controls: Only show dropdowns if not native -->
    <div v-if="!isNative" class="controls flex flex-wrap grid-nogutter">
      <Select
        v-if="videoInputOptions"
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
        v-if="audioInputOptions"
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
    <div class="actions flex flex-column gap-3 w-full align-items-center">
      <Button
        @click="toggleRecording"
        :disabled="isProcessing || error || nativeError"
        class="record-btn"
        :class="{ recording: isRecording }"
        :label="
          isProcessing
            ? 'Processing...'
            : isRecording
            ? `Stop Recording (${remainingTime}s)`
            : 'Start Recording'
        "
      />
      <Button
        :disabled="isRecording"
        @click="emit('close-capture')"
        class="record-btn close-btn"
        label="Close Capture"
        severity="secondary"
      />
    </div>
    <!-- <div v-if="isProcessing" class="loading-indicator">Processing...</div> -->
  </div>
</template>

<style scoped>
.capture-video-audio {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--p-sky-50);
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
