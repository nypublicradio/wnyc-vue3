export interface capacitorIosNotificationSettingsPlugin {
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
}
