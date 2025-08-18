/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'qc-primary': '#0B6B63',
        'qc-accent': '#FFB020',
        'qc-lilac': '#8B5CF6',
        'qc-bg': '#F6F9FA',
        'qc-glass': 'rgba(255,255,255,0.74)',
        'qc-text': '#0F1724',
      },
      borderRadius: {
        'qc-radius': '12px',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'qc': '0 8px 24px rgba(15, 23, 42, 0.06)',
        'qc-lg': '0 12px 28px rgba(15, 23, 42, 0.12)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float-delayed 3s ease-in-out infinite 1.5s',
        'bounce-slow': 'bounce 2s infinite',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}

