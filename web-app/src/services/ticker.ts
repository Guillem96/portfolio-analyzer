import { type TickerInfo, Country, CurrencyType } from "@/types.d"

const BASE_URL = import.meta.env.VITE_TICKER_URL
const CURRENCY_MAPPER: Record<string, CurrencyType> = {
  EUR: "€",
  USD: "$",
  GBp: "£",
}

export const fetchTicker = async (ticker: string): Promise<TickerInfo | null> => {
  const response = await fetch(`${BASE_URL}/${ticker}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  })

  if (response.status == 404) return null
  if (!response.ok) throw new Error("Failed to fetch ticker.")

  const json = await response.json()

  return mapTicker(ticker, json)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTicker = (ticker: string, tickerFromApi: any): TickerInfo => {
  const country = (tickerFromApi.country == "United States" ? Country.US : tickerFromApi.country) as Country
  return {
    ticker: ticker,
    changeRate: tickerFromApi.change_rate,
    name: tickerFromApi.name,
    isEtf: tickerFromApi.is_etf,
    price: tickerFromApi.currency == "GBp" ? tickerFromApi.price / 100 : tickerFromApi.price,
    yearlyDividendYield: tickerFromApi.yearly_dividend_yield,
    yearlyDividendValue: tickerFromApi.yearly_dividend_value,
    nextDividendYield: tickerFromApi.next_dividend_yield,
    nextDividendValue: tickerFromApi.next_dividend_value,
    currency: CURRENCY_MAPPER[tickerFromApi.currency],
    exDividendDate: new Date(Date.parse(tickerFromApi.ex_dividend_date)),
    earningDates: tickerFromApi.earning_dates.map(Date.parse).map((d: number) => new Date(d)),
    sector: tickerFromApi.sector,
    website: tickerFromApi.website,
    country,
    monthlyPriceRange: {
      min: tickerFromApi.monthly_price_range.min,
      max: tickerFromApi.monthly_price_range.max,
    },
    yearlyPriceRange: {
      min: tickerFromApi.yearly_price_range.min,
      max: tickerFromApi.yearly_price_range.max,
    },
  }
}
