import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors:{
        color1: "#001F3E",
        color1lite: "#b4d9ff",
        color2: "#7EA852",
        color2lite: "#A4C3A2",
        color3: "#FAE27C",
        color3lite: "#FEFCE8",
        color4: "#DBE64C",
        color4lite: "#eaedb9"
      }
    },
  },
  plugins: [],
};
export default config;
