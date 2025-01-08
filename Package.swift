// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapaZip",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "CapaZip",
            targets: ["ZipPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main"),
        .package(url: "https://github.com/ZipArchive/ZipArchive.git", from: "2.4.0")
    ],
    targets: [
        .target(
            name: "ZipPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "SSZipArchive", package: "ZipArchive")
            ],
            path: "ios/Plugin")
    ]
)