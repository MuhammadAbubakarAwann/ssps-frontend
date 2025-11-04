import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // Base colors
        'bg-default': 'var(--bg-default)',
        'bg-base': 'var(--bg-base)',
        'bg-bg-subtle': 'var(--bg-bg-subtle)',
        'bg-bg': 'var(--bg-bg)',
        'bg-bg-hover': 'var(--bg-bg-hover)',
        'bg-bg-color': 'var(--bg-bg-color)',
        'bg-bg-active': 'var(--bg-bg-active)',
        'fg-line': 'var(--fg-line)',
        'fg-border': 'var(--fg-border)',
        'fg-border-hover': 'var(--fg-border-hover)',
        'fg-solid': 'var(--fg-solid)',
        'fg-solid-hover': 'var(--fg-solid-hover)',
        'fg-text': 'var(--fg-text)',
        'fg-text-contrast': 'var(--fg-text-contrast)',
        'fg-default': 'var(--fg-default)',
        'info-text-light': 'var(--info-text-light)',

        // Brand colors
        'brand-gold': '#d6b54a',
        'brand-gold-light': '#eddda9',
        'brand-gold-medium': '#e4c86a',

        // Primary colors
        'primary-base': 'var(--primary-base)',
        'primary-bg-subtle': 'var(--primary-bg-subtle)',
        'primary-bg': 'var(--primary-bg)',
        'primary-bg-hover': 'var(--primary-bg-hover)',
        'primary-bg-active': 'var(--primary-bg-active)',
        'primary-line': 'var(--primary-line)',
        'primary-border': 'var(--primary-border)',
        'primary-border-hover': 'var(--primary-border-hover)',
        'primary-solid': 'var(--primary-solid)',
        'primary-solid-hover': 'var(--primary-solid-hover)',
        'primary-text': 'var(--primary-text)',
        'primary-text-contrast': 'var(--primary-text-contrast)',
        'primary-on-primary': 'var(--primary-on-primary)',
        'primary-light': 'var(--primary-light)',
        'primary-subtitle': 'var(--primary-subtitle)',

        // Secondary colors
        'secondary-base': 'var(--secondary-base)',
        'secondary-bg-subtle': 'var(--secondary-bg-subtle)',
        'secondary-bg': 'var(--secondary-bg)',
        'secondary-bg-hover': 'var(--secondary-bg-hover)',
        'secondary-bg-active': 'var(--secondary-bg-active)',
        'secondary-line': 'var(--secondary-line)',
        'secondary-border': 'var(--secondary-border)',
        'secondary-border-hover': 'var(--secondary-border-hover)',
        'secondary-solid': 'var(--secondary-solid)',
        'secondary-solid-hover': 'var(--secondary-solid-hover)',
        'secondary-text': 'var(--secondary-text)',
        'secondary-text-contrast': 'var(--secondary-text-contrast)',
        'secondary-on-secondary': 'var(--secondary-on-secondary)',

        // Success colors
        'success-base': 'var(--success-base)',
        'success-bg-subtle': 'var(--success-bg-subtle)',
        'success-bg': 'var(--success-bg)',
        'success-bg-hover': 'var(--success-bg-hover)',
        'success-bg-active': 'var(--success-bg-active)',
        'success-line': 'var(--success-line)',
        'success-border': 'var(--success-border)',
        'success-border-hover': 'var(--success-border-hover)',
        'success-solid': 'var(--success-solid)',
        'success-solid-hover': 'var(--success-solid-hover)',
        'success-text': 'var(--success-text)',
        'success-text-contrast': 'var(--success-text-contrast)',
        'success-on-success': 'var(--success-on-success)',

        // Warning colors
        'warning-base': 'var(--warning-base)',
        'warning-bg-subtle': 'var(--warning-bg-subtle)',
        'warning-bg': 'var(--warning-bg)',
        'warning-bg-hover': 'var(--warning-bg-hover)',
        'warning-bg-active': 'var(--warning-bg-active)',
        'warning-line': 'var(--warning-line)',
        'warning-border': 'var(--warning-border)',
        'warning-border-hover': 'var(--warning-border-hover)',
        'warning-solid': 'var(--warning-solid)',
        'warning-solid-hover': 'var(--warning-solid-hover)',
        'warning-text': 'var(--warning-text)',
        'warning-text-contrast': 'var(--warning-text-contrast)',
        'warning-on-warning': 'var(--warning-on-warning)',

        // Alert colors
        'alert-base': 'var(--alert-base)',
        'alert-bg-subtle': 'var(--alert-bg-subtle)',
        'alert-bg': 'var(--alert-bg)',
        'alert-bg-hover': 'var(--alert-bg-hover)',
        'alert-bg-active': 'var(--alert-bg-active)',
        'alert-line': 'var(--alert-line)',
        'alert-border': 'var(--alert-border)',
        'alert-border-hover': 'var(--alert-border-hover)',
        'alert-solid': 'var(--alert-solid)',
        'alert-solid-hover': 'var(--alert-solid-hover)',
        'alert-text': 'var(--alert-text)',
        'alert-text-contrast': 'var(--alert-text-contrast)',
        'alert-on-alert': 'var(--alert-on-alert)',

        // Info colors
        'info-base': 'var(--info-base)',
        'info-bg-subtle': 'var(--info-bg-subtle)',
        'info-bg': 'var(--info-bg)',
        'info-bg-hover': 'var(--info-bg-hover)',
        'info-bg-active': 'var(--info-bg-active)',
        'info-line': 'var(--info-line)',
        'info-border': 'var(--info-border)',
        'info-border-hover': 'var(--info-border-hover)',
        'info-solid': 'var(--info-solid)',
        'info-solid-hover': 'var(--info-solid-hover)',
        'info-text': 'var(--info-text)',
        'info-text-contrast': 'var(--info-text-contrast)',
        'info-on-info': 'var(--info-on-info)',

        // Badge colors
        'badge-published-bg': 'var(--badge-published-bg)',
        'badge-published-text': 'var(--badge-published-text)',
        'badge-published-dot': 'var(--badge-published-dot)',
        'badge-review-bg': 'var(--badge-review-bg)',
        'badge-review-text': 'var(--badge-review-text)',
        'badge-review-dot': 'var(--badge-review-dot)',
        'badge-success-bg': 'var(--badge-success-bg)',
        'badge-success-text': 'var(--badge-success-text)',
        'badge-success-dot': 'var(--badge-success-dot)',
        'badge-sponsored-bg': 'var(--badge-sponsored-bg)',
        'badge-sponsored-text': 'var(--badge-sponsored-text)',
        'badge-sponsored-dot': 'var(--badge-sponsored-dot)',
        'badge-warning-bg': 'var(--badge-warning-bg)',
        'badge-warning-text': 'var(--badge-warning-text)',
        'badge-warning-dot': 'var(--badge-warning-dot)',

        // Overlay colors
        'overlay-100': 'var(--overlay-100)',
        'overlay-200': 'var(--overlay-200)',
        'overlay-300': 'var(--overlay-300)',
        'overlay-400': 'var(--overlay-400)',
        'overlay-500': 'var(--overlay-500)',
        'overlay-600': 'var(--overlay-600)',
        'overlay-700': 'var(--overlay-700)',
        'overlay-800': 'var(--overlay-800)',
        'overlay-900': 'var(--overlay-900)',
        'overlay-1000': 'var(--overlay-1000)',
        'overlay-1100': 'var(--overlay-1100)',
        'overlay-1200': 'var(--overlay-1200)',
        'overlay-modal': 'var(--overlay-modal)',

        // Border colors
        'border-subtle': 'var(--border-subtle)',
        'border-light': 'var(--border-light)',
        'border-image': 'var(--border-image)'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      spacing: {
        32: '8rem'
      },
      fontFamily: {
        // Default fonts
        sans: ['Graphik', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        
        // Dashboard fonts
        'graphik': ['Graphik', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      fontSize: {
        // Default font sizes
        xxs: [
          '0.5625rem',
          {
            lineHeight: '0.75rem',
            letterSpacing: '-0.00563rem'
          }
        ],
        input: ['0.9375rem', { lineHeight: '1.5rem' }],

        // Dashboard font sizes
        'section-heading': ['3.25rem', { lineHeight: '1' }],
        'section-heading-sm': ['2rem', { lineHeight: '1' }]
      },
      screens: {
        xs: '390px',
        sm: '424px',
        ssm: '769px',
        mmd: '767px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        xxl: '1440px',
        mxl: '1360px',
        '2xl': '1618px',
        '3xl': '1700px'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'fade-out': 'fadeOut 0.2s ease-in forwards'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        }
      },
      rotate: {
        '15': '15deg',
        '60': '60deg'
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(90deg, #D6B54A 0%, #EDDDA9 49.52%, #E4C86A 100%)'
      }
    }
  },
  plugins: [],
  corePlugins: {
    opacity: true
  }
};

export default config;
