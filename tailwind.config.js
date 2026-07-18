/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0B0F',
        glass: 'rgba(255,255,255,0.06)',
        accent: '#6EE7F9',
        accentViolet: '#A78BFA',
        text: '#F4F5F7',
        muted: '#9AA3B2',
        success: '#34D399',
        danger: '#F87171',
        warning: '#FBBF24',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
