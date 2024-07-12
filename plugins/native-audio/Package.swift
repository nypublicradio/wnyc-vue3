// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "NativeAudio",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "NativeAudio",
            targets: ["NativeAudioPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main")
    ],
    targets: [
        .target(
            name: "NativeAudioPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/NativeAudioPlugin"),
        .testTarget(
            name: "NativeAudioPluginTests",
            dependencies: ["NativeAudioPlugin"],
            path: "ios/Tests/NativeAudioPluginTests")
    ]
)