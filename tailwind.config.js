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
        // Figma design tokens
        mauve: {
          DEFAULT: "#6f597d",
          50: "#F4F1F6",
          100: "#E8E2EC",
          200: "#D1C6D9",
          300: "#A998B5",
          400: "#897592",
          500: "#6f597d",
          600: "#5A4868",
          700: "#453753",
        },
        peach: {
          DEFAULT: "#cfa29f",
          light: "#E8C9C7",
        },
        figmaGray: "#f0f0f0",
        gold: {
          light: "#ffca17",
          DEFAULT: "#d4a017",
          dark: "#977400",
          border: "#ab8f54",
        },
        // Legacy brand kept for backwards-compat with bits not yet migrated
        brand: {
          DEFAULT: "#6f597d",
          50: "#F4F1F6",
          100: "#E8E2EC",
          200: "#D1C6D9",
          300: "#A998B5",
          400: "#897592",
          500: "#6f597d",
          600: "#5A4868",
          700: "#453753",
        },
        accent: "#E8A0FF",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#d50b32",
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
        display: ["Montserrat", "Inter", "sans-serif"],
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
        "gradient-nav": "linear-gradient(90deg, #CFA29F 0%, #6F597D 45.19%, #071123 100%)",
        "gradient-footer": "linear-gradient(90deg, #CFA29F 0%, #6F597D 45.19%, #071123 100%)",
        "gradient-reward": "linear-gradient(180deg, #5B3D7A 0%, #6B4A8A 50%, #8B5A7A 100%)",
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
