/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('@rtcamp/frappe-ui-react/tailwind/preset')
  ],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@rtcamp/frappe-ui-react/dist/**/*.js'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}