/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
 
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        current: 'currentColor',
        inherit: 'inherit',
        transparent: 'transparent',
        white: '#ffffff',
        black: '#000000',
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
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
        // Custom semantic colors for clarity
        textPrimary: 'hsl(var(--textPrimary))',
        textSecondary: 'hsl(var(--textSecondary))',
        textSubtle: 'hsl(var(--textSubtle))',
        textAccent: 'hsl(var(--textAccent))',
        inputBg: 'hsl(var(--inputBg))',
        inputBorder: 'hsl(var(--inputBorder))',
        inputPlaceholder: 'hsl(var(--inputPlaceholder))',
        inputFocusBorder: 'hsl(var(--inputFocusBorder))',
        inputFocusRing: 'hsl(var(--inputFocusRing))',
        buttonPrimaryBg: 'hsl(var(--buttonPrimaryBg))',
        buttonPrimaryText: 'hsl(var(--buttonPrimaryText))',
        buttonSecondaryBg: 'hsl(var(--buttonSecondaryBg))',
        buttonSecondaryText: 'hsl(var(--buttonSecondaryText))',
        buttonOutlineBorder: 'hsl(var(--buttonOutlineBorder))',
        buttonOutlineText: 'hsl(var(--buttonOutlineText))',
        badgeFeatureBg: 'hsl(var(--badge-feature-bg))',
        badgeFeatureText: 'hsl(var(--badge-feature-text))',
        badgeBugBg: 'hsl(var(--badge-bug-bg))',
        badgeBugText: 'hsl(var(--badge-bug-text))',
        badgeReviewBg: 'hsl(var(--badge-review-bg))',
        badgeReviewText: 'hsl(var(--badge-review-text))',
        badgeTestingBg: 'hsl(var(--badge-testing-bg))',
        badgeTestingText: 'hsl(var(--badge-testing-text))',
        priorityHighBg: 'hsl(var(--priority-high-bg))',
        priorityHighText: 'hsl(var(--priority-high-text))',
        priorityMediumBg: 'hsl(var(--priority-medium-bg))',
        priorityMediumText: 'hsl(var(--priority-medium-text))',
        priorityLowBg: 'hsl(var(--priority-low-bg))',
        priorityLowText: 'hsl(var(--priority-low-text))',
        success: {
          DEFAULT: "hsl(var(--badge-success-bg))",
          foreground: "hsl(var(--badge-success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--badge-warning-bg))",
          foreground: "hsl(var(--badge-warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--badge-info-bg))",
          foreground: "hsl(var(--badge-info-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--badge-destructive-bg))",
          foreground: "hsl(var(--badge-destructive-foreground))",
        },
      },
      backgroundImage: {
        // No gradients for the dashboard design, keeping this empty for now.
      },
    },
  },
  plugins: [],
}
