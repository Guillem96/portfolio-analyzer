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

  return mapTicker(ticker, json)
}

export const fetchMultipleTickers = async (...tickers: string[]): Promise<Record<string, TickerInfo> | null> => {
  console.log("fetchMultipleTickers", tickers)
  const response = await fetch(`${BASE_URL}/${tickers.join(",")}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (response.status == 404) return null
  if (!response.ok) throw new Error("Failed to fetch ticker.")

  const json = await response.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTickers: Array<TickerInfo> = json.map((t: any, index: number) => mapTicker(tickers[index], t))
  return Object.fromEntries(allTickers.map((t) => [t.ticker, t]))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTicker = (ticker: string, tickerFromApi: any): TickerInfo => {
  const country = (tickerFromApi.country == "United States" ? Country.US : tickerFromApi.country) as Country
  return {
    ticker: ticker,
    name: tickerFromApi.name,
    isEtf: tickerFromApi.is_etf,
    price: tickerFromApi.currency == "GBp" ? tickerFromApi.price / 100 : tickerFromApi.price,
    yearlyDividendYield: tickerFromApi.yearly_dividend_yield,
    nextDividendYield: tickerFromApi.next_dividend_yield,
    currency: CURRENCY_MAPPER[tickerFromApi.currency],
    exDividendDate: new Date(Date.parse(tickerFromApi.ex_dividend_date)),
    earningDates: tickerFromApi.earning_dates.map(Date.parse).map((d: number) => new Date(d)),
    sector: tickerFromApi.sector,
    website: tickerFromApi.website,
    country,
  }
}
