import { type TickerInfo } from "@/types.d"

const BASE_URL = "https://wcou3sszabchl2bemt7sxwbjey0cbkmx.lambda-url.eu-west-2.on.aws"

export const fetchTicker = async (ticker: string): Promise<TickerInfo | null> => {
  const response = await fetch(`${BASE_URL}/${ticker}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const json = await response.json()
  if (response.status == 404) return null
  if (!response.ok) throw new Error("Failed to fetch ticker.")

  return {
    price: json.price,
    dividendYield: json.dividend_yield,
    currency: json.currency,
    exDividendDate: Date.parse(json.ex_dividend_date),
    earningDates: json.earning_dates.map(Date.parse),
    sector: json.sector,
    country: json.country,
  }
}
