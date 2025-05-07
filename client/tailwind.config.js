// // frontend/tailwind.config.js
// module.exports = {
//     content: [
//       "./src/**/*.{js,jsx,ts,tsx}",
//       "./public/index.html"
//     ],
//     theme: {
//       extend: {},
//     },
//     plugins: [
//       require('@tailwindcss/typography'),
//       require('@tailwindcss/forms'),
//       require('@tailwindcss/line-clamp'),
//       require('@tailwindcss/aspect-ratio'),
//     ],
//   }
  

// frontend/tailwind.config.js

// frontend/tailwind.config.js
// frontend/tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      animation: {
        bubble: "bubble 8s linear infinite",
      },
      keyframes: {
        bubble: {
          "0%": { transform: "translateY(0)", opacity: "0.6" },
          "100%": { transform: "translateY(-100vh)", opacity: "0" },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
