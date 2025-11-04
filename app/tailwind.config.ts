import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Color - Sanctuary Blue
        primary: {
          50: '#f0f4fb',
          100: '#dbe5f5',
          200: '#baceec',
          300: '#8eade0',
          400: '#5c86d0',
          500: '#2A4B8D', // Main Sanctuary Blue
          600: '#234078',
          700: '#1d3463',
          800: '#1a2d53',
          900: '#192846',
        },
        // Secondary Brand Colors
        gold: {
          50: '#fdfaf3',
          100: '#f9f1dc',
          200: '#f3e1b8',
          300: '#eacc8a',
          400: '#ddb25d',
          500: '#C9A34A', // Liturgical Gold
          600: '#b48a3a',
          700: '#956d31',
          800: '#7a5830',
          900: '#67492a',
        },
        sage: {
          50: '#f4f9f5',
          100: '#e5f1e8',
          200: '#cce3d2',
          300: '#a5cdb0',
          400: '#7bb18a',
          500: '#6DA67A', // Sage Green
          600: '#528762',
          700: '#426d50',
          800: '#375742',
          900: '#2e4737',
        },
        rosary: {
          50: '#fcf4f4',
          100: '#f9e7e7',
          200: '#f4d3d3',
          300: '#ebb3b3',
          400: '#de8686',
          500: '#C85151', // Rosary Red
          600: '#b93e3e',
          700: '#9a3232',
          800: '#802e2e',
          900: '#6b2b2b',
        },
        // Neutral Colors
        ash: '#E5E7EB', // Ash Grey
        charcoal: '#1D1D1F', // Charcoal Ink
      },
      borderRadius: {
        'liturgi': '6px',
        'liturgi-lg': '8px',
      },
      fontSize: {
        'body': ['15px', { lineHeight: '1.6' }],
        'body-lg': ['16px', { lineHeight: '1.6' }],
      },
    },
  },
  plugins: [],
}
export default config
