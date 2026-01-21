import 'dotenv/config';

export default {
  expo: {
    name: "AL DÍA",
    slug: "al-dia-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.aldia.app", 
      
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ],
      
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    
    extra: {
      apiUrl: process.env.API_URL,
      googleMapsKey: process.env.GOOGLE_MAPS_KEY,
      // 👇 AQUÍ ESTÁ EL ID QUE FALTABA
      eas: {
        projectId: "2cd121eb-06d4-49dc-bdb8-dc5a23f63a4a"
      }
    },
    
    plugins: [
      [
        "expo-camera",
        {
          "cameraPermission": "Permitir a AL DÍA acceder a la cámara para escanear documentos."
        }
      ]
    ]
  }
};