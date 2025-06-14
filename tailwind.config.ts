import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import { token } from "@atlaskit/tokens";
import tokenNames from "@atlaskit/tokens/token-names";
import tailwindAnimate from "tailwindcss-animate";
import tailwindAnimated from "tailwindcss-animated";

const atlassianColorTokens = (
  Object.keys(tokenNames) as (keyof typeof tokenNames)[]
).filter(
  (item) =>
    !item.includes("elevation.shadow.overflow") &&
    !item.includes("elevation.shadow.overlay") &&
    !item.includes("elevation.shadow.raised")
);

const atlassianBoxShadowTokens = [
  "elevation.shadow.overflow",
  "elevation.shadow.overlay",
  "elevation.shadow.raised",
] as const;

type OmittedColors =
  | "blueGray"
  | "lightBlue"
  | "warmGray"
  | "trueGray"
  | "coolGray";

type ColorTypes = Omit<typeof colors, OmittedColors>;

const allColors: ColorTypes = colors;

delete allColors["blueGray"];
delete allColors["lightBlue"];
delete allColors["warmGray"];
delete allColors["trueGray"];
delete allColors["coolGray"];

const config: Config = {
  content: ["./static/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ["class", '[data-color-mode="dark"]'],
  theme: {
    extend: {},
    colors: {
      ...allColors,
      "ad-lime": {
        100: "rgb(var(--color-lime-100) / <alpha-value>)",
        200: "rgb(var(--color-lime-200) / <alpha-value>)",
        300: "rgb(var(--color-lime-300) / <alpha-value>)",
        400: "rgb(var(--color-lime-400) / <alpha-value>)",
        500: "rgb(var(--color-lime-500) / <alpha-value>)",
        600: "rgb(var(--color-lime-600) / <alpha-value>)",
        700: "rgb(var(--color-lime-700) / <alpha-value>)",
        800: "rgb(var(--color-lime-800) / <alpha-value>)",
        900: "rgb(var(--color-lime-900) / <alpha-value>)",
        1000: "rgb(var(--color-lime-1000) / <alpha-value>)",
      },
      "ad-red": {
        100: "rgb(var(--color-red-100) / <alpha-value>)",
        200: "rgb(var(--color-red-200) / <alpha-value>)",
        300: "rgb(var(--color-red-300) / <alpha-value>)",
        400: "rgb(var(--color-red-400) / <alpha-value>)",
        500: "rgb(var(--color-red-500) / <alpha-value>)",
        600: "rgb(var(--color-red-600) / <alpha-value>)",
        700: "rgb(var(--color-red-700) / <alpha-value>)",
        800: "rgb(var(--color-red-800) / <alpha-value>)",
        900: "rgb(var(--color-red-900) / <alpha-value>)",
        1000: "rgb(var(--color-red-1000) / <alpha-value>)",
      },
      "ad-orange": {
        100: "rgb(var(--color-orange-100) / <alpha-value>)",
        200: "rgb(var(--color-orange-200) / <alpha-value>)",
        300: "rgb(var(--color-orange-300) / <alpha-value>)",
        400: "rgb(var(--color-orange-400) / <alpha-value>)",
        500: "rgb(var(--color-orange-500) / <alpha-value>)",
        600: "rgb(var(--color-orange-600) / <alpha-value>)",
        700: "rgb(var(--color-orange-700) / <alpha-value>)",
        800: "rgb(var(--color-orange-800) / <alpha-value>)",
        900: "rgb(var(--color-orange-900) / <alpha-value>)",
        1000: "rgb(var(--color-orange-1000) / <alpha-value>)",
      },
      "ad-yellow": {
        100: "rgb(var(--color-yellow-100) / <alpha-value>)",
        200: "rgb(var(--color-yellow-200) / <alpha-value>)",
        300: "rgb(var(--color-yellow-300) / <alpha-value>)",
        400: "rgb(var(--color-yellow-400) / <alpha-value>)",
        500: "rgb(var(--color-yellow-500) / <alpha-value>)",
        600: "rgb(var(--color-yellow-600) / <alpha-value>)",
        700: "rgb(var(--color-yellow-700) / <alpha-value>)",
        800: "rgb(var(--color-yellow-800) / <alpha-value>)",
        900: "rgb(var(--color-yellow-900) / <alpha-value>)",
        1000: "rgb(var(--color-yellow-1000) / <alpha-value>)",
      },
      "ad-green": {
        100: "rgb(var(--color-green-100) / <alpha-value>)",
        200: "rgb(var(--color-green-200) / <alpha-value>)",
        300: "rgb(var(--color-green-300) / <alpha-value>)",
        400: "rgb(var(--color-green-400) / <alpha-value>)",
        500: "rgb(var(--color-green-500) / <alpha-value>)",
        600: "rgb(var(--color-green-600) / <alpha-value>)",
        700: "rgb(var(--color-green-700) / <alpha-value>)",
        800: "rgb(var(--color-green-800) / <alpha-value>)",
        900: "rgb(var(--color-green-900) / <alpha-value>)",
        1000: "rgb(var(--color-green-1000) / <alpha-value>)",
      },
      "ad-teal": {
        100: "rgb(var(--color-teal-100) / <alpha-value>)",
        200: "rgb(var(--color-teal-200) / <alpha-value>)",
        300: "rgb(var(--color-teal-300) / <alpha-value>)",
        400: "rgb(var(--color-teal-400) / <alpha-value>)",
        500: "rgb(var(--color-teal-500) / <alpha-value>)",
        600: "rgb(var(--color-teal-600) / <alpha-value>)",
        700: "rgb(var(--color-teal-700) / <alpha-value>)",
        800: "rgb(var(--color-teal-800) / <alpha-value>)",
        900: "rgb(var(--color-teal-900) / <alpha-value>)",
        1000: "rgb(var(--color-teal-1000) / <alpha-value>)",
      },
      "ad-blue": {
        100: "rgb(var(--color-blue-100) / <alpha-value>)",
        200: "rgb(var(--color-blue-200) / <alpha-value>)",
        300: "rgb(var(--color-blue-300) / <alpha-value>)",
        400: "rgb(var(--color-blue-400) / <alpha-value>)",
        500: "rgb(var(--color-blue-500) / <alpha-value>)",
        600: "rgb(var(--color-blue-600) / <alpha-value>)",
        700: "rgb(var(--color-blue-700) / <alpha-value>)",
        800: "rgb(var(--color-blue-800) / <alpha-value>)",
        900: "rgb(var(--color-blue-900) / <alpha-value>)",
        1000: "rgb(var(--color-blue-1000) / <alpha-value>)",
      },
      "ad-purple": {
        100: "rgb(var(--color-purple-100) / <alpha-value>)",
        200: "rgb(var(--color-purple-200) / <alpha-value>)",
        300: "rgb(var(--color-purple-300) / <alpha-value>)",
        400: "rgb(var(--color-purple-400) / <alpha-value>)",
        500: "rgb(var(--color-purple-500) / <alpha-value>)",
        600: "rgb(var(--color-purple-600) / <alpha-value>)",
        700: "rgb(var(--color-purple-700) / <alpha-value>)",
        800: "rgb(var(--color-purple-800) / <alpha-value>)",
        900: "rgb(var(--color-purple-900) / <alpha-value>)",
        1000: "rgb(var(--color-purple-1000) / <alpha-value>)",
      },
      "ad-magenta": {
        100: "rgb(var(--color-magenta-100) / <alpha-value>)",
        200: "rgb(var(--color-magenta-200) / <alpha-value>)",
        300: "rgb(var(--color-magenta-300) / <alpha-value>)",
        400: "rgb(var(--color-magenta-400) / <alpha-value>)",
        500: "rgb(var(--color-magenta-500) / <alpha-value>)",
        600: "rgb(var(--color-magenta-600) / <alpha-value>)",
        700: "rgb(var(--color-magenta-700) / <alpha-value>)",
        800: "rgb(var(--color-magenta-800) / <alpha-value>)",
        900: "rgb(var(--color-magenta-900) / <alpha-value>)",
        1000: "rgb(var(--color-magenta-1000) / <alpha-value>)",
      },
      neutral: {
        0: "rgb(var(--color-neutral-0) / <alpha-value>)",
        100: "rgb(var(--color-neutral-100) / <alpha-value>)",
        200: "rgb(var(--color-neutral-200) / <alpha-value>)",
        300: "rgb(var(--color-neutral-300) / <alpha-value>)",
        400: "rgb(var(--color-neutral-400) / <alpha-value>)",
        500: "rgb(var(--color-neutral-500) / <alpha-value>)",
        600: "rgb(var(--color-neutral-600) / <alpha-value>)",
        700: "rgb(var(--color-neutral-700) / <alpha-value>)",
        800: "rgb(var(--color-neutral-800) / <alpha-value>)",
        900: "rgb(var(--color-neutral-900) / <alpha-value>)",
        1000: "rgb(var(--color-neutral-1000) / <alpha-value>)",
        1100: "rgb(var(--color-neutral-1100) / <alpha-value>)",

        "100A": "var(--color-neutral-100A)",
        "200A": "var(--color-neutral-200A)",
        "300A": "var(--color-neutral-300A)",
        "400A": "var(--color-neutral-400A)",
        "500A": "var(--color-neutral-500A)",
      },
      "ad-bg": "rgb(var(--color-bg) / <alpha-value>)",
      "ad-text": "rgb(var(--color-text) / <alpha-value>)",
      ...atlassianColorTokens.reduce(
        (acc, cur) => ((acc[cur] = token(cur)), acc),
        {}
      ),
    },
    boxShadow: {
      ...atlassianBoxShadowTokens.reduce(
        (acc, cur) => ((acc[cur] = token(cur)), acc),
        {}
      ),
      onboard: "0 0 0 2px var(--ds-border-accent-purple, #C0B6F2)",
      table:
        "0 8px 8px -8px var(--ds-shadow-overflow-spread, #091e4229), 0 1px 1px -1px var(--ds-shadow-overflow-perimeter, #091e421f)",
    },
  },
  plugins: [tailwindAnimate, tailwindAnimated],
};
export default config;
