import { pipeline, env } from "@huggingface/transformers"

// Skip local model checks since we're running in browser/client
env.allowLocalModels = false
env.useBrowserCache = true

export default function useTranscribe () {
  const transcribeMedia = async (mediaFile: File, lang: string = "en") => {
    try {
      // Initialize the pipeline
      // Using 'Xenova/whisper-tiny' as it's a good balance for browser usage
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny"
      )

      // Create a URL for the file so the pipeline can read it
      const url = URL.createObjectURL(mediaFile)

      // Run transcription
      // return_timestamps: true is optional but good for structure if we need it later
      // chunk_length_s: 30 is standard for Whisper
      const result = await transcriber(url, {
        language: lang,
        chunk_length_s: 30,
        return_timestamps: true,
      })

      // Cleanup
      URL.revokeObjectURL(url)

      // The result from the pipeline is typically an object { text: "..." } or array of chunks
      // We need to return a single string to match previous behavior
      if (typeof result === "object" && result !== null && "text" in result) {
        return (result as { text: string }).text
      } else if (Array.isArray(result)) {
        return result.map((chunk: any) => chunk.text).join(" ")
      }

      return ""
    } catch (error) {
      console.error("Transcription error:", error)
      throw error
    }
  }

  return { transcribeMedia }
}
