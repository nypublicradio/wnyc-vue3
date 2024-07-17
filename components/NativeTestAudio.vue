<script lang="ts" setup>
import { RemoteStreamer } from "mp3-hls-streaming"

let isPlaying = ref(false)
let currentTime = ref(0)
let currentSource = ref("")

const hlsStream = "https://hls-live.wnyc.org/wnycfmapp-hls.aac/playlist.m3u8"
const mp3Episode =
  "https://chrt.fm/track/53A61E/pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/74d5512f-0f0f-4f1e-b4b0-b55f533d55d2/episodes/03699946-0b48-433f-8e01-70a8dce0a31c/audio/128/default.mp3?aid=rss_feed&awCollectionId=74d5512f-0f0f-4f1e-b4b0-b55f533d55d2&awEpisodeId=03699946-0b48-433f-8e01-70a8dce0a31c&feed=kyG_uojt"

onMounted(async () => {
  await RemoteStreamer.addListener("timeUpdate", (data: any) => {
    currentTime.value = data.currentTime
  })
  await RemoteStreamer.addListener("play", () => {
    console.log("playing")
    isPlaying.value = true
  })

  await RemoteStreamer.addListener("pause", () => {
    console.log("paused")
    isPlaying.value = false
  })

  await RemoteStreamer.addListener("stop", () => {
    console.log("stopped")
    currentSource.value = ""
    isPlaying.value = false
    currentTime.value = 0
  })
})

async function togglePlay(source: string) {
  console.log("isPlaying.value", isPlaying.value)
  console.log("currentSource.value", currentSource.value)
  console.log("source", source)
  if (isPlaying.value && currentSource.value === source) {
    await RemoteStreamer.pause()
  } else {
    if (currentSource.value !== source) {
      console.log("stop, play and set current source")
      await RemoteStreamer.stop()
      await RemoteStreamer.play({ url: source })
      currentSource.value = source
    } else {
      await RemoteStreamer.resume()
      console.log("resuming")
    }
  }
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}
</script>

<template>
  <div class="player-container">
    <div class="player-item">
      <h2>HLS Stream</h2>
      <button @click="() => togglePlay(hlsStream)">
        {{ isPlaying && currentSource === hlsStream ? "Pause" : "Play" }}
      </button>
      <p>Current Time: {{ formatTime(currentTime) }}</p>
    </div>

    <div class="player-item">
      <h2>MP3 Episode</h2>
      <button
        @click="
          () => {
            togglePlay(mp3Episode)
          }
        "
      >
        {{ isPlaying && currentSource === mp3Episode ? "Pause" : "Play" }}
      </button>
      <p>Current Time: {{ formatTime(currentTime) }}</p>
    </div>
  </div>
</template>
<style lang="scss">
.player-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  height: 100%;
  font-family: Arial, sans-serif;

  .player-item {
    background-color: #f0f0f0;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    width: 300px;
    text-align: center;
  }

  h2 {
    margin-top: 0;
    color: #333;
  }

  button {
    background-color: #4caf50;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #45a049;
  }

  p {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
  }
}
</style>
