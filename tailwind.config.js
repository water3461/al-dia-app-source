/** @type {import('tailwindcss').Config} */
module.exports = {
  // Aquí indicamos que escanee App.tsx y toda la carpeta src
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      // Aquí puedes agregar los colores de tu marca "AL DÍA" si los definimos luego
      colors: {
        brand: {
          primary: '#007AFF', // Ejemplo
          secondary: '#34C759',
        }
      }
    },
  },
  plugins: [],
}