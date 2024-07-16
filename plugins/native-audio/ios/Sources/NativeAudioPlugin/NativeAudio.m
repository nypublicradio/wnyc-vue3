#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(NativeAudioPlugin, "NativeAudio",
           CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(playAudio, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(pauseAudio, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(seek, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setNowPlaying, CAPPluginReturnPromise);
)