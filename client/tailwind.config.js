/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#D4AF37',
        'secondary-rose': '#B76E79',
        accent: '#D4AF37',
        dark: '#333333',
        light: '#F9F9F9',
        border: '#E5E5E5',
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'container': '1400px',
      },
    },
  },
  plugins: [],
};
