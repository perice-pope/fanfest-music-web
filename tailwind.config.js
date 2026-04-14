/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0B10",
        surface: "#14141C",
        surface2: "#1C1C26",
        border: "#262633",
        muted: "#8B8B9E",
        text: "#F5F5FA",
        brand: {
          DEFAULT: "#E6FF3A",
          600: "#D4EE21",
          700: "#B8D110",
        },
        accent: "#8A5CF6",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
