/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PTNK Branding Colors - Xanh dương và xanh ngọc
        primary: {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#1890ff', // Xanh dương chính
          600: '#096dd9',
          700: '#0050b3',
          800: '#003a8c',
          900: '#002766',
        },
        teal: {
          50: '#e6fffb',
          100: '#b5f5ec',
          200: '#87e8de',
          300: '#5cdbd3',
          400: '#36cfc9',
          500: '#13c2c2', // Xanh ngọc chính
          600: '#08979c',
          700: '#006d75',
          800: '#00474f',
          900: '#002329',
        },
        // Giữ lại màu cũ cho backward compatibility
        blue: {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#1890ff',
          600: '#096dd9',
          700: '#0050b3',
          800: '#003a8c',
          900: '#002766',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

