import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Monay Colors from Android
        monay: {
          primary: '#08AAFF',  // colorPrimary - Main blue
          primaryDark: '#08AAFF',  // colorPrimaryDark
          accent: '#08AAFF',  // colorAccent
          blue: '#027BFF',  // blue
          darkBlue: '#074FFE',  // dark_blue
          lightBlue: '#66d8ff',  // sky_blue
          lightBlueCard: '#2CAAFF',  // light_blue_card
          blueMix: '#B6C9F3',  // white_blue_light_mix
        },
        // Red/Orange Colors
        monayRed: {
          primary: '#FF4619',  // red & orange_red
          light: '#ff6666',  // light_red
          orangeLight: '#FD7654',  // orange_red_light
          mix: '#F7BBA8',  // white_red_mix
          lightMix: '#FCF8F8',  // white_red_light_mix
        },
        // Yellow/Orange
        monayYellow: {
          primary: '#FFCB00',  // yellowish
          light: '#FA9E5A',  // light_yellow
        },
        // Success/Error
        status: {
          success: '#0B9810',  // success_text
          error: '#E65848',  // status_color
        },
        // Grays and Background
        monayGray: {
          dark: '#111111',  // dark_black
          medium: '#40454E',  // gray
          light: '#7E7E7E',  // ligh_black
          lighter: '#9098A9',  // gray_color
          lightest: '#BCBCBC',  // gray_light
          text: '#6C6C6C',  // articles_middle_txt
          bg: '#F7F7F7',  // light_gray
          bgLight: '#FCF8F8',  // white_gray_color
          bgCard: '#F0F0F0',  // card_view_color
        },
        // Keep existing colors for compatibility
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          500: '#08AAFF',
          600: '#027BFF',
          700: '#074FFE',
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        }
      },
      fontFamily: {
        cera: ['CeraPro', 'system-ui', 'sans-serif'],
        'cera-black': ['CeraPro-Black', 'system-ui', 'sans-serif'],
        'cera-bold': ['CeraPro-Bold', 'system-ui', 'sans-serif'],
        'cera-medium': ['CeraPro-Medium', 'system-ui', 'sans-serif'],
        'cera-light': ['CeraPro-Light', 'system-ui', 'sans-serif'],
        sans: ['CeraPro', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'monay-gradient': 'linear-gradient(135deg, #08AAFF 0%, #074FFE 100%)',
        'card-gradient-blue': 'linear-gradient(135deg, #08AAFF 0%, #2CAAFF 100%)',
        'card-gradient-orange': 'linear-gradient(135deg, #FF4619 0%, #FD7654 100%)',
      },
      boxShadow: {
        'monay': '0 4px 12px rgba(8, 170, 255, 0.15)',
        'monay-lg': '0 8px 24px rgba(8, 170, 255, 0.2)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'zoom-in': 'zoomIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;