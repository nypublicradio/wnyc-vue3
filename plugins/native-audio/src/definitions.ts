export interface NativeAudioPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  playAudio(audio: string): Promise<void>;
}
