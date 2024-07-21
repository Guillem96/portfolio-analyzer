import { type TickerInfo, Country, CurrencyType } from "@/types.d"

const BASE_URL = "https://wcou3sszabchl2bemt7sxwbjey0cbkmx.lambda-url.eu-west-2.on.aws"
const CURRENCY_MAPPER: Record<string, CurrencyType> = {
  EUR: "€",
  USD: "$",
  GBp: "£",
}

export const fetchTicker = async (ticker: string): Promise<TickerInfo | null> => {
  const response = await fetch(`${BASE_URL}/${ticker}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (response.status == 404) return null
  if (!response.ok) throw new Error("Failed to fetch ticker.")

  const json = await response.json()

  const country = (json.country == "United States" ? Country.US : json.country) as Country
  return {
    ticker: ticker,
    name: json.name,
    isEtf: json.is_etf,
    price: json.currency == "GBp" ? json.price / 100 : json.price,
    yearlyDividendYield: json.yearly_dividend_yield,
    nextDividendYield: json.next_dividend_yield,
    currency: CURRENCY_MAPPER[json.currency],
    exDividendDate: new Date(Date.parse(json.ex_dividend_date)),
    earningDates: json.earning_dates.map(Date.parse).map((d: number) => new Date(d)),
    sector: json.sector,
    website: json.website,
    country,
  }
}
