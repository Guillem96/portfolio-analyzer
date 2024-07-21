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
  nextDividendYield: number
  currency: CurrencyType
  exDividendDate: Date
  earningDates: Date[]
  sector: string
  website: string
  country: Country
  isEtf: boolean
}

export interface Buy {
  ticker: string
  date: number
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
  date: number
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
  ticker: string
  buyValue: number
  value: number
  units: number
  country: Country
  sector: string
  currency: CurrencyType
}

export interface JSONBin {
  investments?: InvestmentWithId[]
}

export interface JSONBinSettings {
  accessKey: string
  binId: string
}

declare global {
  interface ObjectConstructor {
    groupBy<T, K extends string | number | symbol>(array: T[], callback: (item: T) => K): Record<K, T[]>
  }
}
