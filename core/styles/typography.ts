/**
 * Typography styles based on design system
 * Converted from Flutter TextStyle to TypeScript/CSS
 */

export const typography = {
  // Headings
  headingH1: {
    fontSize: "46px",
    fontWeight: 700, // Bold
    fontFamily: "Roboto, sans-serif",
  },
  headingH2Bold: {
    fontSize: "32px",
    fontWeight: 700, // Bold
    fontFamily: "Roboto, sans-serif",
  },
  headingH2Semibold: {
    fontSize: "32px",
    fontWeight: 600, // Semibold
    fontFamily: "Roboto, sans-serif",
  },
  headingH3: {
    fontSize: "24px",
    fontWeight: 700, // Bold
    fontFamily: "Roboto, sans-serif",
  },
  headingH4: {
    fontSize: "23px",
    fontWeight: 400, // Light
    fontFamily: "Roboto, sans-serif",
  },
  headingH5: {
    fontSize: "22px",
    fontWeight: 700, // Bold
    fontFamily: "Roboto, sans-serif",
  },
  headingH6Bold: {
    fontSize: "20px",
    fontWeight: 700, // Bold
    fontFamily: "Roboto, sans-serif",
  },
  headingH6Regular: {
    fontSize: "20px",
    fontWeight: 400, // Regular
    fontFamily: "Roboto, sans-serif",
  },

  // Paragraphs
  paragraphP1Bold: {
    fontSize: "18px",
    fontWeight: 700, // Bold
    fontFamily: "Roboto, sans-serif",
  },
  paragraphP2Bold: {
    fontSize: "16px",
    fontWeight: 700, // Bold
    fontFamily: "Roboto, sans-serif",
  },
  paragraphP2Regular: {
    fontSize: "16px",
    fontWeight: 400, // Regular
    fontFamily: "Roboto, sans-serif",
  },
  paragraphP3: {
    fontSize: "15px",
    fontWeight: 700, // Bold
    fontFamily: "Roboto, sans-serif",
  },
  paragraphP4Bold: {
    fontSize: "14px",
    fontWeight: 700, // Bold
    fontFamily: "Roboto, sans-serif",
  },
  paragraphP4Semibold: {
    fontSize: "14px",
    fontWeight: 600, // Semibold
    fontFamily: "Roboto, sans-serif",
  },
  paragraphP4Regular: {
    fontSize: "14px",
    fontWeight: 400, // Regular
    fontFamily: "Roboto, sans-serif",
  },
  paragraphP5Semibold: {
    fontSize: "13px",
    fontWeight: 600, // Semibold
    fontFamily: "Roboto, sans-serif",
  },
  paragraphP5Regular: {
    fontSize: "13px",
    fontWeight: 400, // Regular
    fontFamily: "Roboto, sans-serif",
  },

  // Captions
  captionSemibold: {
    fontSize: "12px",
    fontWeight: 600, // Semibold
    fontFamily: "Roboto, sans-serif",
  },
  captionMedium: {
    fontSize: "12px",
    fontWeight: 500, // Medium
    fontFamily: "Roboto, sans-serif",
  },
  captionRegular: {
    fontSize: "12px",
    fontWeight: 400, // Regular
    fontFamily: "Roboto, sans-serif",
  },
} as const

// Type for typography keys
export type TypographyKey = keyof typeof typography

// Helper function to get typography style
export const getTypographyStyle = (key: TypographyKey): string => {
  const style = typography[key]
  return `
    font-size: ${style.fontSize};
    font-weight: ${style.fontWeight};
    font-family: ${style.fontFamily};
  `
}

// CSS class mapping for typography
export const typographyClasses: Record<TypographyKey, string> = {
  headingH1: "text-[46px] font-bold font-roboto",
  headingH2Bold: "text-[32px] font-bold font-roboto",
  headingH2Semibold: "text-[32px] font-semibold font-roboto",
  headingH3: "text-[24px] font-bold font-roboto",
  headingH4: "text-[23px] font-normal font-roboto",
  headingH5: "text-[22px] font-bold font-roboto",
  headingH6Bold: "text-[20px] font-bold font-roboto",
  headingH6Regular: "text-[20px] font-normal font-roboto",
  paragraphP1Bold: "text-[18px] font-bold font-roboto",
  paragraphP2Bold: "text-[16px] font-bold font-roboto",
  paragraphP2Regular: "text-[16px] font-normal font-roboto",
  paragraphP3: "text-[15px] font-bold font-roboto",
  paragraphP4Bold: "text-[14px] font-bold font-roboto",
  paragraphP4Semibold: "text-[14px] font-semibold font-roboto",
  paragraphP4Regular: "text-[14px] font-normal font-roboto",
  paragraphP5Semibold: "text-[13px] font-semibold font-roboto",
  paragraphP5Regular: "text-[13px] font-normal font-roboto",
  captionSemibold: "text-[12px] font-semibold font-roboto",
  captionMedium: "text-[12px] font-medium font-roboto",
  captionRegular: "text-[12px] font-normal font-roboto",
}
