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
      // ⚠️ Asegúrate de que este sea el mismo paquete que usaste antes.
      // Si Expo se queja de "package mismatch", cámbialo aquí.
      package: "com.aldia.app", 
      
      // Permisos necesarios para que la app no se cierre
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ],
      
      // Inyección de la clave de mapas en Android
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    
    // Variables extra para el código JS
    extra: {
      apiUrl: process.env.API_URL,
      googleMapsKey: process.env.GOOGLE_MAPS_KEY
    },
    
    // Configuración del plugin de cámara (requerido para el OCR)
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