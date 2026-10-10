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
          DEFAULT: '#0B1F3A',
          900: '#0B1F3A',
          800: '#122A4D',
          700: '#1E3A66'
        },
        brand: {
          DEFAULT: '#FF6A00',
          600: '#FF6A00',
          500: '#FF8A2B',
          400: '#FFA85C'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F5F7FA',
          border: '#E5E9F0'
        },
        text: {
          DEFAULT: '#0B1F3A',
          muted: '#64748B'
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
        card: '0 4px 20px rgba(11,31,58,0.06)',
        lift: '0 10px 30px rgba(11,31,58,0.12)'
      }
    }
  },
  plugins: []
}

export default config
