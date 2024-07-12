import { registerPlugin } from '@capacitor/core';

import type { NativeAudioPlugin } from './definitions';

const NativeAudio = registerPlugin<NativeAudioPlugin>('NativeAudio', {
  web: () => import('./web').then(m => new m.NativeAudioWeb()),
});

export * from './definitions';
export { NativeAudio };
