/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ctp: {
          base: '#1E1E2E',
          mantle: '#181825',
          text: '#CDD6F4',
          surface0: '#313244',
          surface1: '#45475A',
          peach: '#FAB387',
          blue: '#89B4FA',
          green: '#A6E3A1',
          mauve: '#CBA6F7'
        }
      }
    }
  },
  plugins: []
};
