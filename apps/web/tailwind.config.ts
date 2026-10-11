import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1B33',
          900: '#071426',
          800: '#102746',
          700: '#1C3B60'
        },
        brand: {
          DEFAULT: '#E66A1A',
          600: '#D85D12',
          500: '#F17A2B',
          400: '#FFA15C'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F4F6F9',
          border: '#E3E8EF'
        },
        text: {
          DEFAULT: '#0A1B33',
          muted: '#627087'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px'
      },
      boxShadow: {
        card: '0 5px 24px rgba(10,27,51,0.055)',
        lift: '0 16px 38px rgba(10,27,51,0.12)',
        soft: '0 2px 10px rgba(10,27,51,0.04)'
      }
    }
  },
  plugins: []
}

export default config
