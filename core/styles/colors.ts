/**
 * Color palette based on design system
 * Converted from Flutter Color to TypeScript/CSS
 */

export const colors = {
  // Status colors
  pending: "#f4d400",

  // Dividers
  divider: "rgba(29, 36, 31, 0.16)", // 0x281d241f
  darkDivider: "rgba(29, 36, 31, 0.22)", // 0x381d241f

  // Primary colors
  primary: {
    100: "#eafff1",
    200: "#49ea7d",
    300: "#2edd65",
    400: "#1bc552",
    500: "#0fb645",
    600: "#07a53a",
    700: "#03822c",
    800: "#027b29",
    900: "#004e19",
  },

  // Accent colors
  accent: {
    100: "#ffeaea",
    200: "#ea4c49",
    300: "#dd302e",
    400: "#d12825",
    500: "#b6120f",
    600: "#a50a07",
    700: "#910503",
    800: "#7b0402",
    900: "#4d0100",
  },

  // Neutral colors
  neutrals: {
    800: "#1d241f",
    700: "#343d37",
    600: "#5e6761",
    500: "#727874",
    400: "#a3a9a4",
    300: "#b3bab5",
    200: "#d7dbd8",
    100: "#edefee",
    white: "#ffffff",
  },

  // Dark colors
  dark: {
    500: "#1d241f",
    400: "#828282",
    300: "#a0a0a0",
    200: "#bbbbbb",
    100: "#f0f0f0",
    white: "#ffffff",
  },

  // Gradients (as CSS strings)
  gradients: {
    inactiveCat: "linear-gradient(to bottom, #ffffff, #f0f0f0)",
    catTabLinear: "linear-gradient(to bottom, #ffffff, #c9c9c9)",
  },
} as const

// Type for color keys
export type ColorKey =
  | "pending"
  | "divider"
  | "darkDivider"
  | `primary.${keyof typeof colors.primary}`
  | `accent.${keyof typeof colors.accent}`
  | `neutrals.${keyof typeof colors.neutrals}`
  | `dark.${keyof typeof colors.dark}`
  | `gradients.${keyof typeof colors.gradients}`

// Helper function to get color value
export const getColor = (key: ColorKey): string => {
  const [category, shade] = key.split(".")

  if (!shade) {
    return colors[category as keyof typeof colors] as string
  }

  const colorCategory = colors[category as keyof typeof colors]
  if (typeof colorCategory === "object" && colorCategory !== null) {
    return colorCategory[shade as keyof typeof colorCategory] as string
  }

  return ""
}
