/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hoyne: {
          dark: '#140f0b',
          stout: '#211813',
          wood: '#2f2219',
          copper: '#c87d32',
          gold: '#eab308',
          amber: '#d97706',
          cream: '#f5efe6',
          parchment: '#fdfbf7',
          hop: '#4d7c0f',
          ocean: '#0369a1',
        }
      },
      fontFamily: {
        display: ['Cinzel', '"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Playfair Display"', 'Cinzel', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      }
    },
  },
  plugins: [],
}
