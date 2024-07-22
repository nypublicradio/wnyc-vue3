<script lang="ts" setup>
import { RemoteStreamer } from "mp3-hls-streaming"

let isPlaying = ref(false)
let isError = ref(null)
let isBuffering = ref(false)
let currentTime = ref(0)
let currentSource = ref(null)

const hlsStream = "https://hls-live.wnyc.org/wnycfmapp-hls.aac/playlist.m3u8"
const mp3Episode =
  "https://chrt.fm/track/53A61E/pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/74d5512f-0f0f-4f1e-b4b0-b55f533d55d2/episodes/03699946-0b48-433f-8e01-70a8dce0a31c/audio/128/default.mp3?aid=rss_feed&awCollectionId=74d5512f-0f0f-4f1e-b4b0-b55f533d55d2&awEpisodeId=03699946-0b48-433f-8e01-70a8dce0a31c&feed=kyG_uojt"

const setWebMediaSession = (media: object) => {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Unforgettable",
      artist: "Nat King Cole",
      album: "The Ultimate Collection (Remastered)",
      artwork: [
        {
          src: "https://dummyimage.com/96x96",
          sizes: "96x96",
          type: "image/png",
        },
        {
          src: "https://dummyimage.com/128x128",
          sizes: "128x128",
          type: "image/png",
        },
        {
          src: "https://dummyimage.com/192x192",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "https://dummyimage.com/256x256",
          sizes: "256x256",
          type: "image/png",
        },
        {
          src: "https://dummyimage.com/384x384",
          sizes: "384x384",
          type: "image/png",
        },
        {
          src: "https://dummyimage.com/512x512",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    })

    navigator.mediaSession.setActionHandler("play", async () => {
      await RemoteStreamer.resume()
      /* Code excerpted. */
    })
    navigator.mediaSession.setActionHandler("pause", async () => {
      await RemoteStreamer.pause()
      /* Code excerpted. */
    })
    // navigator.mediaSession.setActionHandler("stop", () => {
    //   /* Code excerpted. */
    // })
    // navigator.mediaSession.setActionHandler("seekbackward", () => {
    //   /* Code excerpted. */
    // })
    // navigator.mediaSession.setActionHandler("seekforward", () => {
    //   /* Code excerpted. */
    // })
    // navigator.mediaSession.setActionHandler("seekto", () => {
    //   /* Code excerpted. */
    // })
    // navigator.mediaSession.setActionHandler("previoustrack", () => {
    //   /* Code excerpted. */
    // })
    // navigator.mediaSession.setActionHandler("nexttrack", () => {
    //   /* Code excerpted. */
    // })
    // navigator.mediaSession.setActionHandler("skipad", () => {
    //   /* Code excerpted. */
    // })
    // navigator.mediaSession.setActionHandler("togglecamera", () => {
    //   /* Code excerpted. */
    // })
    // navigator.mediaSession.setActionHandler("togglemicrophone", () => {
    //   /* Code excerpted. */
    // })
    // navigator.mediaSession.setActionHandler("hangup", () => {
    //   /* Code excerpted. */
    // })
  }
}

onMounted(async () => {
  await RemoteStreamer.addListener("error", (err: any) => {
    isError.value = err
  })
  await RemoteStreamer.addListener("timeUpdate", (data: any) => {
    currentTime.value = data.currentTime
  })
  await RemoteStreamer.addListener("play", (e) => {
    console.log("playing", e)
    isPlaying.value = true
    isBuffering.value = false
  })

  await RemoteStreamer.addListener("pause", (e) => {
    console.log("paused", e)
    isPlaying.value = false
  })

  await RemoteStreamer.addListener("buffering", (e) => {
    console.log("buffering in JS", e)
    if (!isPlaying.value) {
      isBuffering.value = true
    }
  })

  await RemoteStreamer.addListener("stop", () => {
    console.log("stopped")
    currentSource.value = null
    isPlaying.value = false
    isBuffering.value = false
    currentTime.value = 0
  })
})

async function togglePlay(source: string) {
  console.log("isPlaying.value", isPlaying.value)
  console.log("currentSource.value", currentSource.value)
  console.log("source", source)
  if (isPlaying.value && currentSource.value === source) {
    await RemoteStreamer.pause()
    console.log("paused")
  } else {
    if (currentSource.value !== source) {
      console.log("stop, play and set current source")
      isBuffering.value = true
      await RemoteStreamer.stop()
      currentSource.value = source
      await RemoteStreamer.play({ url: source })
      setWebMediaSession({ source })
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
      <p>{{ isError }}</p>
      <button @click="() => togglePlay(hlsStream)">
        {{ isPlaying && currentSource === hlsStream ? "Pause" : "Play" }}
      </button>
      <p>Current Time: {{ formatTime(currentTime) }}</p>
    </div>

    <div class="player-item">
      <h2>MP3 Episode</h2>
      <p>{{ isError }}</p>
      <button
        @click="
          () => {
            togglePlay(mp3Episode)
          }
        "
      >
        <pre>{{ isBuffering }}</pre>
        <div v-if="currentSource === mp3Episode && isBuffering">Buffering...</div>
        <div v-else>
          {{ isPlaying && currentSource === mp3Episode ? "Pause" : "Play" }}
        </div>
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

  p,
  pre {
    margin-top: 10px;
    font-size: 14px;
    color: #333;
    font-weight: bolder;
  }
}
</style>
