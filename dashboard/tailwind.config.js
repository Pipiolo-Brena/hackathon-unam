/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // NFL
        'nfl-blue': '#013369',
        'nfl-red': '#D50A0A',
        'nfl-white': '#FFFFFF',
        'gridiron-black': '#000000',
        'legacy-blue': '#001D3C',
        'impact-blue': '#0074EE',
        'legacy-red': '#410000',
        'unity-red': '#A00000',
        // UNAM
        'unam-blue': '#002B7A',
        'unam-blue-alt': '#013B75',
        'unam-gold': '#D59F0F',
        'unam-gold-bright': '#D9A500',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'Impact', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.8)',
        glow: '0 0 0 1px rgba(213,159,15,0.5), 0 0 18px -4px rgba(213,159,15,0.45)',
      },
    },
  },
  plugins: [],
}
