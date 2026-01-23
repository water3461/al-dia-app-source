module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Este plugin es obligatorio para NativeWind
      "nativewind/babel",
      
      // Si usas Reanimated (común en React Native), debe ir al final:
      // 'react-native-reanimated/plugin', 
    ],
  };
};