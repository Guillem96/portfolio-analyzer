import { CurrencyType } from "@/types"

const URL = "https://v6.exchangerate-api.com/v6/83a609d5f4903a781a8462fc/latest"

const parseRates = (rates: { conversion_rates: Record<string, number> }): Record<CurrencyType, number> => {
  return {
    $: rates.conversion_rates.USD,
    "€": rates.conversion_rates.EUR,
    "£": rates.conversion_rates.GBP,
  }
}
const fetchUSDRates = async (): Promise<Record<CurrencyType, number>> => {
  const response = await fetch(`${URL}/USD`, {
    method: "GET",
  })
  if (!response.ok) throw new Error("Failed to fetch rates.")
  const rates = await response.json()
  return parseRates(rates)
}

const fetchGBPRates = async (): Promise<Record<CurrencyType, number>> => {
  const response = await fetch(`${URL}/GBP`, {
    method: "GET",
  })
  if (!response.ok) throw new Error("Failed to fetch rates.")
  const rates = await response.json()
  return parseRates(rates)
}

const fetchEURRates = async (): Promise<Record<CurrencyType, number>> => {
  const response = await fetch(`${URL}/EUR`, {
    method: "GET",
  })
  if (!response.ok) throw new Error("Failed to fetch rates.")
  const rates = await response.json()
  return parseRates(rates)
}

export const fetchAllRates = async (): Promise<Record<CurrencyType, Record<CurrencyType, number>>> => {
  try {
    const [usdRates, gbpRates, eurRates] = await Promise.all([fetchUSDRates(), fetchGBPRates(), fetchEURRates()])
    return {
      $: usdRates,
      "€": eurRates,
      "£": gbpRates,
    }
  } catch (error) {
    console.error(error)
    throw new Error("Failed to fetch rates.")
  }
}
