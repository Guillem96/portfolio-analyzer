import { Risk, Country } from "@/types.d"

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
