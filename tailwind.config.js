import themer from "@tailus/themer";
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  safelist: ["isToggled"],
  theme: {
    fontFamily: {
      sans: ['Geist', 'Inter', ...defaultTheme.fontFamily.sans],
      mono : ['GeistMono', 'fira-code', ...defaultTheme.fontFamily.mono],
    },
      // keyframes: {
      //     loop: {
      //         to: {
      //             "offset-distance": "100%",
      //         },
      //     },
      // },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2c595a",
          dark: "#2c595a",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"),  themer({
    palette: {
        extend : "nature"
    },
    radius: "smoothest",
    background: "light",
    border: "light",
    padding:"large",
    components: {
        button: {
            rounded : "2xl"
        }
    }
})],
  // Important to prevent conflicts with Ant Design
  important: true,
}

