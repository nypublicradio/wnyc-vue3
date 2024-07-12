import Foundation

@objc public class NativeAudio: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
