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
        // Neutros del tema claro
        'field-mist': '#F4F7FA',
        'field-line': '#DCE3EC',
        'ink-muted': '#4A5D73',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'Impact', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,29,60,0.06), 0 6px 20px -12px rgba(0,29,60,0.25)',
        lift: '0 4px 8px rgba(0,29,60,0.08), 0 18px 36px -18px rgba(0,29,60,0.45)',
        gold: '0 0 0 2px rgba(213,159,15,0.55), 0 8px 24px -10px rgba(213,159,15,0.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'ball-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'ball-spin': 'ball-spin 1.1s linear infinite',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
}
