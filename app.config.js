export default {
  expo: {
    name: "ScanPayApp",
    slug: "ScanPayApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#6C63FF"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.vikram.scanpayapp"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#6C63FF"
      },
      package: "com.vikram.scanpayapp"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Allow ScanPay to access your camera to scan products."
        }
      ]
    ]
  }
};
