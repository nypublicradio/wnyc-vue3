import { pipeline, env } from "@huggingface/transformers"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

// Skip local model checks since we're running in browser/client
env.allowLocalModels = false
env.useBrowserCache = true

export default function useTranscribe () {
  const transcribeMedia = async (mediaFile: File, lang = "en") => {
    try {
      // Initialize the pipeline
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny"
      )

      let audioUrl: string

      if (mediaFile.name.toLowerCase().endsWith('.mov')) {
        // Initialize FFmpeg
        const ffmpeg = new FFmpeg()

        const origin = window.location.origin
        // Use ESM version for single-threaded operation (no SharedArrayBuffer needed)
        const corePath = `${origin}/ffmpeg/ffmpeg-core-st.js`
        const wasmPath = `${origin}/ffmpeg/ffmpeg-core-st.wasm`

        // Load ffmpeg.wasm in single-threaded mode
        // Use toBlobURL for BOTH to avoid worker scheme issues
        // Setting workerURL to undefined forces single-threaded mode
        await ffmpeg.load({
          coreURL: await toBlobURL(corePath, 'text/javascript'),
          wasmURL: await toBlobURL(wasmPath, 'application/wasm'),
          workerURL: undefined, // Force single-threaded mode
        })

        // Write video file to FFmpeg memory filesystem
        await ffmpeg.writeFile('input.mov', await fetchFile(mediaFile))

        // Convert to WAV (16kHz, mono) for Whisper
        await ffmpeg.exec(['-i', 'input.mov', '-ac', '1', '-ar', '16000', 'output.wav'])

        // Read output and create blob URL
        const fileData = await ffmpeg.readFile('output.wav')
        const wavBlob = new Blob([fileData as any], { type: 'audio/wav' })
        audioUrl = URL.createObjectURL(wavBlob)
        // Audio extracted from MOV, starting transcription...
      } else {
        audioUrl = URL.createObjectURL(mediaFile)
        // Using original file for transcription...
      }

      // Run transcription on the WAV file
      const result = await transcriber(audioUrl, {
        language: lang,
        chunk_length_s: 30,
        return_timestamps: true,
      })

      // Cleanup
      URL.revokeObjectURL(audioUrl)
      // Clean up ffmpeg memory if possible or rely on GC/destroy? 
      // ffmpeg.terminate() is available in some versions, but local instance will be GC'd.

      if (typeof result === "object" && result !== null && "text" in result) {
        return (result as { text: string }).text
      } else if (Array.isArray(result)) {
        return result.map((chunk: any) => chunk.text).join(" ")
      }

      return ""
    } catch (error: any) {
      console.error("Transcription error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        raw: error
      })
      throw error
    }
  }

  return { transcribeMedia }
}
