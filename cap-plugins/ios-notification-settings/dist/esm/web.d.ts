import { WebPlugin } from '@capacitor/core';
import type { capacitorIosNotificationSettingsPlugin } from './definitions';
export declare class capacitorIosNotificationSettingsWeb extends WebPlugin implements capacitorIosNotificationSettingsPlugin {
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
}
