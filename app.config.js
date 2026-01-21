import 'dotenv/config'; // Carga las variables locales si estás probando en tu PC

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
      // ⚠️ IMPORTANTE: Verifica que este sea tu nombre de paquete real
      package: "com.aldia.app", 
      
      // Permisos para OCR (Cámara/Archivos) y Mapas
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ],
      
      // CONFIGURACIÓN DE MAPAS (La parte crítica que fallaba)
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    
    // Aquí pasamos las variables al código Javascript de la App
    extra: {
      apiUrl: process.env.API_URL,
      googleMapsKey: process.env.GOOGLE_MAPS_KEY,
      eas: {
        projectId: "tu-project-id-de-expo" // (Opcional, Expo lo suele llenar solo)
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