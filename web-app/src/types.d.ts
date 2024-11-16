type CurrencyType = "$" | "€" | "£"

export enum Country {
  ES = "Spain",
  FR = "France",
  US = "US",
  GR = "Germany",
  UK = "United Kingdom",
}

export enum Risk {
  LOW_RISK = "low",
  MEDIUM_RISK = "medium",
  HIGH_RISK = "high",
}

export interface TickerInfo {
  ticker: string
  name: string
  price: number
  yearlyDividendYield: number | null
  yearlyDividendValue: number | null
  nextDividendYield: number
  nextDividendValue: number | null
  currency: CurrencyType
  exDividendDate: Date
  earningDates: Date[]
  sector: string
  website: string
  country: Country
  isEtf: boolean
}

type ExDividendEvent = {
  eventType: "Ex-Dividend"
  ticker: TickerInfo
  extraData: {
    dividendValue: number
    dividendYield: number
    expectedAmount: number
  }
}

type EarningEvent = {
  eventType: "Earning"
  ticker: TickerInfo
}

export type Event = ExDividendEvent | EarningEvent

export interface Buy {
  ticker: string
  date: string
  currency: CurrencyType
  amount: number
  units: number
  isDividendReinvestment: boolean
  preview?: boolean
}

export interface BuyWithId extends Buy {
  id: string
}

export interface Dividend {
  company: string
  amount: number
  date: string
  country: Country
  doubleTaxationOrigin: number
  doubleTaxationDestination: number
  currency: CurrencyType
  preview?: boolean
}

export interface DividendWithId extends Dividend {
  id: string
}

export interface Asset {
  name: stirng
  ticker: TickerInfo
  buyValue: number
  value: number
  units: number
  country: Country
  sector: string
  avgPrice: number
  currency: CurrencyType
}

export interface User {
  email: string
  name: string
  picture: string
  preferredCurrency: CurrencyType
}

declare global {
  interface ObjectConstructor {
    groupBy<T, K extends string | number | symbol>(array: T[], callback: (item: T) => K): Record<K, T[]>
  }
}
