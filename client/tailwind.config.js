/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../views/**/*.js',
    './src/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#2196f3',
          'primary-content': '#ffffff',
          'base-200': '#f1f5f9',
        },
      },
    ],
  },
};
