export interface NativeAudioPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  playAudio(options: { audio: string }): Promise<void>;
  pauseAudio(): Promise<void>;
  seek(options: { position: number }): Promise<void>;
  setNowPlaying(options: { title: string, artist: string, album: string, imageUrl: string }): Promise<void>;
}
