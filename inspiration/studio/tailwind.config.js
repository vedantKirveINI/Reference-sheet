import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "dark-blue": {
          50: "var(--dark-blue-50)",
          100: "var(--dark-blue-100)",
          200: "var(--dark-blue-200)",
          300: "var(--dark-blue-300)",
          400: "var(--dark-blue-400)",
          500: "var(--dark-blue-500)",
          600: "var(--dark-blue-600)",
          700: "var(--dark-blue-700)",
          800: "var(--dark-blue-800)",
          900: "var(--dark-blue-900)",
        },
        red: {
          50: "var(--red-50)",
          100: "var(--red-100)",
          200: "var(--red-200)",
          300: "var(--red-300)",
          400: "var(--red-400)",
          500: "var(--red-500)",
          600: "var(--red-600)",
          700: "var(--red-700)",
          800: "var(--red-800)",
          900: "var(--red-900)",
        },
        green: {
          50: "var(--green-50)",
          100: "var(--green-100)",
          300: "var(--green-300)",
          500: "var(--green-500)",
          600: "var(--green-600)",
          700: "var(--green-700)",
          800: "var(--green-800)",
          900: "var(--green-900)",
        },
        yellow: {
          50: "var(--yellow-50)",
          100: "var(--yellow-100)",
          200: "var(--yellow-200)",
          300: "var(--yellow-300)",
          400: "var(--yellow-400)",
          500: "var(--yellow-500)",
          600: "var(--yellow-600)",
          700: "var(--yellow-700)",
          800: "var(--yellow-800)",
        },
        orange: {
          50: "var(--orange-50)",
          100: "var(--orange-100)",
          200: "var(--orange-200)",
          300: "var(--orange-300)",
          400: "var(--orange-400)",
          500: "var(--orange-500)",
          600: "var(--orange-600)",
          700: "var(--orange-700)",
          800: "var(--orange-800)",
          900: "var(--orange-900)",
        },
        "blue-gray": {
          50: "var(--blue-gray-50)",
          100: "var(--blue-gray-100)",
          200: "var(--blue-gray-200)",
          300: "var(--blue-gray-300)",
          400: "var(--blue-gray-400)",
          500: "var(--blue-gray-500)",
          600: "var(--blue-gray-600)",
          700: "var(--blue-gray-700)",
          800: "var(--blue-gray-800)",
          900: "var(--blue-gray-900)",
        },
        purple: {
          50: "var(--purple-50)",
          100: "var(--purple-100)",
          200: "var(--purple-200)",
          300: "var(--purple-300)",
          400: "var(--purple-400)",
          500: "var(--purple-500)",
          600: "var(--purple-600)",
          700: "var(--purple-700)",
          800: "var(--purple-800)",
          900: "var(--purple-900)",
        },
        "dark-green": {
          50: "var(--dark-green-50)",
          100: "var(--dark-green-100)",
          200: "var(--dark-green-200)",
          300: "var(--dark-green-300)",
          500: "var(--dark-green-500)",
          600: "var(--dark-green-600)",
          700: "var(--dark-green-700)",
          800: "var(--dark-green-800)",
          900: "var(--dark-green-900)",
        },
        white: {
          DEFAULT: "#ffffff",
          50: "var(--white-50)",
          100: "var(--white-100)",
          200: "var(--white-200)",
          300: "var(--white-300)",
          400: "var(--white-400)",
          500: "var(--white-500)",
          600: "var(--white-600)",
          700: "var(--white-700)",
          800: "var(--white-800)",
        },
        success: "var(--sucess)",
        error: "var(--error)",
        info: "var(--info)",
        warning: "var(--warning)",
        grey: {
          50: "rgb(250, 252, 254)",
          100: "rgb(236, 239, 241)",
          200: "rgb(207, 216, 220)",
          300: "rgb(176, 190, 197)",
          400: "rgb(144, 164, 174)",
          500: "rgb(120, 144, 156)",
          600: "rgb(96, 125, 139)",
          700: "rgb(84, 110, 122)",
          800: "rgb(69, 90, 100)",
          900: "rgb(55, 71, 79)",
          A100: "rgb(38, 50, 56)",
          main: "rgb(96, 125, 139)",
          light: "rgb(250, 252, 254)",
          dark: "rgb(38, 50, 56)",
          contrastText: "#fff",
        },
        blue: {
          50: "rgb(227, 242, 253)",
          100: "rgb(187, 222, 251)",
          200: "rgb(144, 202, 249)",
          300: "rgb(100, 181, 246)",
          400: "rgb(66, 165, 245)",
          500: "rgb(33, 150, 243)",
          600: "rgb(30, 136, 229)",
          700: "rgb(25, 118, 210)",
          800: "rgb(21, 101, 192)",
          900: "rgb(13, 71, 161)",
          main: "rgb(33, 150, 243)",
          light: "rgb(227, 242, 253)",
          dark: "rgb(25, 118, 210)",
          contrastText: "#fff",
        },
        "oute-background-color": "rgb(250, 252, 254)",
        "oute-background-hover": "rgba(38, 50, 56, 0.1)",
        "oute-background-active": "rgb(33, 150, 243)",
        "oute-background-selected": "rgb(227, 242, 253)",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        surface: {
          base: "#ffffff",
          elevated: "rgba(255, 255, 255, 0.95)",
          overlay: "rgba(255, 255, 255, 0.90)",
        },
        ocean: {
          50: "#f8fafc",
          100: "#f1f5f9",
        },
      },
      height: {
        "input-sm": "32px",
        "input": "36px",
        "input-lg": "40px",
      },
      minHeight: {
        "input-sm": "32px",
        "input": "36px",
        "input-lg": "40px",
      },
      boxShadow: {
        "island-sm":
          "0 1px 2px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)",
        island: "0 2px 8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        "island-md":
          "0 4px 16px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        "island-lg":
          "0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        "island-xl":
          "0 16px 48px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        "island-hover":
          "0 4px 12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        island: "1.5rem",
        "island-sm": "1rem",
        "island-lg": "2rem",
        "island-xl": "2.5rem",
      },
      backdropBlur: {
        island: "20px",
        "island-sm": "12px",
      },
      fontFamily: {
        sans: ["var(--font-family)", "Inter", "sans-serif"],
      },
      fontWeight: {
        light: "var(--font-weight-light)",
        normal: "var(--font-weight-regular)",
        medium: "var(--font-weight-semi-bold)",
        semibold: "var(--font-weight-semi-bold)",
        bold: "var(--font-weight-bold)",
      },
      fontSize: {
        body1: [
          "1rem",
          {
            lineHeight: "1.5rem",
            letterSpacing: "0.032rem",
          },
        ],
        body2: [
          "0.875rem",
          {
            lineHeight: "1.25rem",
            letterSpacing: "0.0157rem",
          },
        ],
        h1: [
          "5.5rem",
          {
            lineHeight: "6rem",
            letterSpacing: "0.094rem",
          },
        ],
        h2: [
          "3.5rem",
          {
            lineHeight: "3.75rem",
            letterSpacing: "0.031rem",
          },
        ],
        h3: [
          "3rem",
          {
            lineHeight: "3.125rem",
            letterSpacing: "0",
          },
        ],
        h4: [
          "2rem",
          {
            lineHeight: "2.5rem",
            letterSpacing: "0.0157rem",
          },
        ],
        h5: [
          "1.5rem",
          {
            lineHeight: "2rem",
            letterSpacing: "0.0157rem",
          },
        ],
        h6: [
          "1.25rem",
          {
            lineHeight: "1.5rem",
            letterSpacing: "0.0157rem",
          },
        ],
        subtitle1: [
          "1rem",
          {
            lineHeight: "1.5rem",
            letterSpacing: "0.0157rem",
          },
        ],
        subtitle2: [
          "0.875rem",
          {
            lineHeight: "1.25rem",
            letterSpacing: "0.007rem",
          },
        ],
        caption: [
          "0.75rem",
          {
            lineHeight: "1.25rem",
            letterSpacing: "0.033rem",
          },
        ],
        overline: [
          "0.625rem",
          {
            lineHeight: "1rem",
            letterSpacing: "0.094rem",
          },
        ],
        xsmallchip: [
          "0.625rem",
          {
            lineHeight: "1rem",
          },
        ],
        capital: [
          "0.75rem",
          {
            lineHeight: "1.25rem",
            letterSpacing: "0.033rem",
            textTransform: "uppercase",
          },
        ],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pulse-indicator": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-indicator": "pulse-indicator 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
