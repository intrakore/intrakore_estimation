// tailwind.config.js in your SPA
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/intrakore-ui/src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},  // No preset needed - use tokens.css
  },
  plugins: [],
}
