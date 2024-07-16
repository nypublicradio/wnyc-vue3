import { WebPlugin } from '@capacitor/core';

import type { NativeAudioPlugin } from './definitions';

export class NativeAudioWeb extends WebPlugin implements NativeAudioPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options.value);
    return options;
  }

  async playAudio(options: { audio: string }): Promise<void> {
    console.log('ECHO', options.audio);
  }
}
