module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FADFC6',
          100: '#F7D7A3',
          200: '#E6BF66',
          300: '#F2826A',
          400: '#D65859',
          500: '#FD9F93',
          600: '#FAC7C6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: [],
};