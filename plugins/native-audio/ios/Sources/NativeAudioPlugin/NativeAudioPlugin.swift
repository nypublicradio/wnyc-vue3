import Foundation
import Capacitor
import UIKit
import AVKit
import MediaPlayer

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */

@objc(NativeAudioPlugin)
public class NativeAudioPlugin: CAPPlugin {
    private let implementation = NativeAudio()
    public static var player: AVPlayer?

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        let nowPlaying = MPNowPlayingInfoCenter.default().nowPlayingInfo
        let title = nowPlaying?[MPMediaItemPropertyTitle] as? String ?? "idk"
        call.resolve([
            "value": implementation.echo(value) + " " + title
        ])
    }

    @objc func playAudio(_ call: CAPPluginCall) {
        let audio = call.getString("audio", "")
        guard let url = URL(string: audio) else { return }
        NativeAudioPlugin.player = AVPlayer(url: url)

        DispatchQueue.main.async {
            NativeAudioPlugin.player?.play()

            NativeAudioPlugin.setupRemoteTransportControls()
            
            var nowPlayingInfo = [String: Any]()
            nowPlayingInfo[MPMediaItemPropertyTitle] = "WNYC"
            nowPlayingInfo[MPMediaItemPropertyArtist] = "WNYCCC"
            nowPlayingInfo[MPMediaItemPropertyGenre] = "News"

            MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo
        }
    }

    static func setupRemoteTransportControls() {
        let commandCenter = MPRemoteCommandCenter.shared()
        
        // Play command
        commandCenter.playCommand.isEnabled = true
        commandCenter.playCommand.addTarget { event in
            player?.play()
            return .success
        }
        
        // Pause command
        commandCenter.pauseCommand.isEnabled = true
        commandCenter.pauseCommand.addTarget { event in
            player?.pause()
            return .success
        }
    }

 
}
