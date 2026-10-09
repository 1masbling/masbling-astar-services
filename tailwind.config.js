/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
        },
        navy: {
          50: '#eef2f8', 100: '#d4dde9', 200: '#a8bbd3', 300: '#7c98bd',
          400: '#5075a7', 500: '#345883', 600: '#274566', 700: '#1d3450',
          800: '#142339', 900: '#0a1726', 950: '#050c16',
        },
        teal: {
          50: '#eefbf9', 100: '#d3f5f0', 200: '#a8ebe2', 300: '#6ddcd0',
          400: '#38c3b8', 500: '#1ba89e', 600: '#128a82', 700: '#106d69',
          800: '#105656', 900: '#0e484a', 950: '#04292b',
        },
        gold: {
          50: '#fdf9ed', 100: '#faeecb', 200: '#f5da93', 300: '#efc15b',
          400: '#eaa833', 500: '#e08a18', 600: '#c46d12', 700: '#9c4f13',
          800: '#7e3f16', 900: '#6a3517', 950: '#3c1a09',
        },
        accent: {
          50: '#fef3f2', 100: '#fee4e1', 200: '#fecdca', 300: '#fda89f',
          400: '#fb7a6c', 500: '#f54d3a', 600: '#e2301a', 700: '#bd2313',
          800: '#9b2015', 900: '#7f2016',
        },
        success: {
          50: '#edfcf2', 100: '#cbf8da', 200: '#94efb6', 300: '#5ce191',
          400: '#2fcd6e', 500: '#15b153', 600: '#099042', 700: '#087237',
          800: '#0a5b30', 900: '#084b2a',
        },
        warning: {
          50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047',
          400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207',
          800: '#854d0e', 900: '#713f12',
        },
        error: {
          50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
          400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
          800: '#991b1b', 900: '#7f1d1d',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(10,23,38,0.08), 0 1px 2px rgba(10,23,38,0.04)',
        'card-hover': '0 8px 24px rgba(10,23,38,0.12), 0 2px 6px rgba(10,23,38,0.06)',
        glow: '0 0 20px rgba(234,168,51,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
};
