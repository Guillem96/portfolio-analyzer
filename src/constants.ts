import { Risk, Country, CurrencyType } from "@/types.d"

export const RISK_COLOR = {
  [Risk.LOW_RISK]: "bg-green-400",
  [Risk.MEDIUM_RISK]: "bg-yellow-400",
  [Risk.HIGH_RISK]: "bg-red-500",
}

export const COUNTRY_EMOJI = {
  [Country.ES]: "🇪🇸",
  [Country.FR]: "🇫🇷",
  [Country.UK]: "🇬🇧",
  [Country.US]: "🇺🇸",
  [Country.GR]: "🇩🇪",
}

export const EXCHANGE_RATES: Record<CurrencyType, Record<CurrencyType, number>> = {
  $: {
    "€": 0.93,
    $: 1,
    "£": 0.79,
  },
  "€": {
    "€": 1,
    $: 1.07,
    "£": 0.85,
  },
  "£": {
    "€": 1.18,
    $: 1.27,
    "£": 1,
  },
}

export const PASTEL_VIVID_COLORS = [
  "#F08080", // Light Coral
  "#DB7093", // Pale Violet Red
  "#9370DB", // Medium Purple
  "#BA55D3", // Medium Orchid
  "#D8BFD8", // Thistle
  "#DDA0DD", // Plum
  "#FFB6C1", // Light Pink
  "#FFA07A", // Light Salmon
  "#FFDAB9", // Peach Puff
  "#FAFAD2", // Light Goldenrod Yellow
  "#EEE8AA", // Pale Goldenrod
  "#90EE90", // Light Green
  "#66CDAA", // Medium Aquamarine
  "#7FFFD4", // Aquamarine
  "#ADD8E6", // Light Blue
  "#B0E0E6", // Powder Blue
  "#87CEEB", // Sky Blue
  "#B0C4DE", // Light Steel Blue
  "#E6E6FA", // Lavender
  "#FFE4E1", // Misty Rose
]
