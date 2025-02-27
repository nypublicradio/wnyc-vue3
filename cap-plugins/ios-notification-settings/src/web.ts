import { WebPlugin } from '@capacitor/core';

import type { capacitorIosNotificationSettingsPlugin } from './definitions';

export class capacitorIosNotificationSettingsWeb extends WebPlugin implements capacitorIosNotificationSettingsPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
