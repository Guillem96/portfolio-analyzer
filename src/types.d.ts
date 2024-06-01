export interface Investment {
  amount: number
  date: number
  currency: "$" | "€"
  preview?: boolean
}

export interface InvestmentWithId extends Investment {
  id: string
}

export enum Country {
  ES = "Spain",
  FR = "France",
  US = "US",
  GR = "Germany",
  UK = "United Kingdom",
}

export interface Dividend {
  company: string
  amount: number
  date: number
  country: Country
  doubleTaxationOrigin: number
  doubleTaxationDestination: number
  currency: "$" | "€"
  preview?: boolean
}

export interface DividendWithId extends Dividend {
  id: string
}

export enum Risk {
  LOW_RISK = "low",
  MEDIUM_RISK = "medium",
  HIGH_RISK = "high",
}

export interface Asset {
  name: string
  value: number
  currency: "$" | "€"
  isFixIncome: boolean
  risk: Risk
  tag?: string
  preview?: boolean
}

export interface AssetWithId extends Asset {
  id: string
}

export interface JSONBin {
  investments?: InvestmentWithId[]
  assets?: AssetWithId[]
}

export interface JSONBinSettings {
  accessKey: string
  binId: string
}
