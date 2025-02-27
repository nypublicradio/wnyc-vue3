import { registerPlugin } from '@capacitor/core';
const capacitorIosNotificationSettings = registerPlugin('capacitorIosNotificationSettings', {
    web: () => import('./web').then((m) => new m.capacitorIosNotificationSettingsWeb()),
});
export * from './definitions';
export { capacitorIosNotificationSettings };
//# sourceMappingURL=index.js.map