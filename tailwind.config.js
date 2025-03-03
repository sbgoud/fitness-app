/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          'primary': '#3b82f6', // Blue-500
          'primary-hover': '#2563eb', // Blue-600
        }
      },
    },
    plugins: [],
  }