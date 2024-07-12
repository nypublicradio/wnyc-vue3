import Foundation
import Capacitor
import UIKit
import AVKit

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */

@objc(NativeAudioPlugin)
public class NativeAudioPlugin: CAPPlugin {
    private let implementation = NativeAudio()
    var player: AVPlayer?

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": implementation.echo(value)
        ])
    }

    @objc func playAudio(_ call: CAPPluginCall) {
        guard let url = URL(string: "https://hls-live.wnyc.org/wnycfmapp-hls.aac/playlist.m3u8") else { return }
        player = AVPlayer(url: url)

        DispatchQueue.main.async {
            self.player?.play()
        }
    }
}
