/** @type {import('tailwindcss').Config} */
export default {
  content: [
        "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
  keyframes: {
    fadeIn: {
      "0%": { opacity: 0 },
      "100%": { opacity: 1 },
    },
    slideUp: {
      "0%": { transform: "translateY(40px)", opacity: 0 },
      "100%": { transform: "translateY(0)", opacity: 1 },
    },
  },
  animation: {
    fadeIn: "fadeIn 1.5s ease-in-out",
    slideUp: "slideUp 1s ease-out",
  },
}

  },
  plugins: [],
}

