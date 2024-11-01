import type { Dividend, DividendWithId } from "@/types.d"
import { request } from "./base"

export const fetchDividends = async (): Promise<DividendWithId[]> => {
  return await request("dividends/", "GET")
}

export const postDividend = async (dividend: Dividend): Promise<DividendWithId> => {
  return await request("dividends/", "POST", dividend)
}

export const deleteDividendById = async (id: string) => {
  await request(`dividends/${id}`, "DELETE", id)
}
