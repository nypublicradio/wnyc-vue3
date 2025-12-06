import createModule from "@transcribe/shout"
//import createModule from "@transcribe/shout/src/shout/shout.wasm_no-simd.js"
import { FileTranscriber } from "@transcribe/transcriber"

export default function useTranscribe () {

  const transcribeMedia = async (mediaFile: File, lang: string = "en") => {
    let transcriber: FileTranscriber
    // create new instance
    transcriber = new FileTranscriber({
      createModule,
      //model: "/models/ggml-tiny.bin",
      model: "/models/ggml-tiny-q5_1.bin",
    })

    // and initialize the transcriber
    await transcriber.init()

    // check if transcriber is initialized
    if (!transcriber?.isReady) return

    // there must be at least one user interaction (e.g click) before you can call this function
    // @ts-ignore
    const result = await transcriber.transcribe(mediaFile, { lang: lang })

    // do something with the result and return it
    return result.transcription.map((t) => t.text).join(" ")
  }

  return { transcribeMedia }
}
