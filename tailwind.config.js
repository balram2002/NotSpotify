/** @type {plugin | ((options?: Partial<{strategy: "base" | "class"}>) => {handler: () => void})} */
const plugin = require("@tailwindcss/forms");
module.exports = {
  darkMode: 'class',
  content: [
      "./Admin-Panel/**/*.{html,js}",
    "./node_modules/flowbite/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
