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
