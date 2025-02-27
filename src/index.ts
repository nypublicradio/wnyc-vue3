import { registerPlugin } from '@capacitor/core';

import type { capacitorIosNotificationSettingsPlugin } from './definitions';

const capacitorIosNotificationSettings = registerPlugin<capacitorIosNotificationSettingsPlugin>(
  'capacitorIosNotificationSettings',
  {
    web: () => import('./web').then((m) => new m.capacitorIosNotificationSettingsWeb()),
  },
);

export * from './definitions';
export { capacitorIosNotificationSettings };
