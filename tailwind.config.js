/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF8FF",
        surface: "#FFFFFF",
        surface2: "#F3EEFF",
        border: "#E2D9F3",
        muted: "#7C7493",
        text: "#1A1525",
        brand: {
          DEFAULT: "#7C3AED",
          50: "#F5F0FF",
          100: "#EDE5FF",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#7C3AED",
          600: "#6D28D9",
          700: "#5B21B6",
        },
        accent: "#E8A0FF",
        success: "#22C55E",
        warning: "#F59E0B",
        pink: {
          light: "#F5D0E0",
          DEFAULT: "#E891B9",
        },
        lavender: {
          50: "#FAF8FF",
          100: "#F3EEFF",
          200: "#E8DEFF",
          300: "#D4C0F7",
          400: "#B794F6",
          500: "#9F67F8",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(124,58,237,0.06), 0 4px 16px rgba(124,58,237,0.04)",
        "card-lg": "0 4px 24px rgba(124,58,237,0.08)",
        glow: "0 0 20px rgba(124,58,237,0.15)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #E8DEFF 0%, #D4C0F7 50%, #B794F6 100%)",
        "gradient-hero": "linear-gradient(135deg, #F3EEFF 0%, #E8DEFF 30%, #FAF8FF 100%)",
        "gradient-nav": "linear-gradient(to right, #8B6FA8 0%, #5B3D7A 50%, #3D2852 100%)",
        "gradient-footer": "linear-gradient(135deg, #2D1B4E 0%, #1A1525 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
