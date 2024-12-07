import type { Dividend, DividendWithId } from "@/types.d"
import { request } from "./base"

export const fetchDividends = async (): Promise<DividendWithId[]> => {
  return await request("dividends/", "GET")
}

export const fetchDividendsPreferredCurrency = async (): Promise<DividendWithId[]> => {
  return await request("dividends/preferred-currency", "GET")
}

export const postDividend = async (dividend: Dividend): Promise<DividendWithId> => {
  return await request("dividends/", "POST", dividend)
}

export const deleteDividendById = async (id: string) => {
  await request(`dividends/${id}`, "DELETE", id)
}

export const updateDividends = async (reinvested: Record<string, boolean>) => {
  const body = Object.entries(reinvested).map(([id, isReinvested]) => ({ id, reinvested: isReinvested }))
  await request(`dividends/`, "PATCH", body)
}
