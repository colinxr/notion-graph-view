/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.css",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
    },
  },
  safelist: [
    "bg-primary",
    "text-primary-foreground",
    "bg-secondary",
    "text-secondary-foreground",
    "bg-accent",
    "text-accent-foreground",
    "bg-muted",
    "text-muted-foreground",
    "bg-card",
    "text-card-foreground",
    "bg-popover",
    "text-popover-foreground",
    "bg-destructive",
    "text-destructive-foreground",
    "bg-border",
    "text-border",
    "border-input",
    "bg-input",
  ],
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities, theme, addComponents, e }) {
      const newUtilities = {
        // Basic background and text colors for all theme colors
        ".bg-background": {
          backgroundColor: theme("colors.background"),
        },
        ".text-foreground": {
          color: theme("colors.foreground"),
        },
        ".bg-card": {
          backgroundColor: theme("colors.card.DEFAULT"),
        },
        ".text-card-foreground": {
          color: theme("colors.card.foreground"),
        },
        ".bg-popover": {
          backgroundColor: theme("colors.popover.DEFAULT"),
        },
        ".text-popover-foreground": {
          color: theme("colors.popover.foreground"),
        },
        ".bg-primary": {
          backgroundColor: theme("colors.primary.DEFAULT"),
        },
        ".text-primary-foreground": {
          color: theme("colors.primary.foreground"),
        },
        ".bg-secondary": {
          backgroundColor: theme("colors.secondary.DEFAULT"),
        },
        ".text-secondary-foreground": {
          color: theme("colors.secondary.foreground"),
        },
        ".bg-accent": {
          backgroundColor: theme("colors.accent.DEFAULT"),
        },
        ".text-accent-foreground": {
          color: theme("colors.accent.foreground"),
        },
        ".bg-muted": {
          backgroundColor: theme("colors.muted.DEFAULT"),
        },
        ".text-muted-foreground": {
          color: theme("colors.muted.foreground"),
        },
        ".bg-destructive": {
          backgroundColor: theme("colors.destructive.DEFAULT"),
        },
        ".text-destructive-foreground": {
          color: theme("colors.destructive.foreground"),
        },

        // Border colors
        ".border-border": {
          borderColor: theme("colors.border"),
        },
        ".border-input": {
          borderColor: theme("colors.input"),
        },

        // Ring utilities
        ".ring-ring": {
          outlineColor: theme("colors.ring"),
          "--tw-ring-color": theme("colors.ring"),
        },
        ".outline-ring\\/50": {
          outlineColor: `color-mix(in srgb, ${theme(
            "colors.ring"
          )} 50%, transparent)`,
        },
        ".ring-ring\\/50": {
          "--tw-ring-color": `color-mix(in srgb, ${theme(
            "colors.ring"
          )} 50%, transparent)`,
        },

        // Shadow utilities
        ".shadow-xs": {
          boxShadow: theme("boxShadow.xs"),
        },
      }

      addUtilities(newUtilities)

      // Add utility for common patterns in components
      addComponents({
        ".focus-visible-ring": {
          "@apply focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none":
            {},
        },
      })
    },
  ],
  experimental: {
    applyRuleGenerationMode: "build-time",
  },
}
