import type { Sell, SellWithId } from "@/types.d"
import { request } from "./base"

export const fetchSells = async (): Promise<SellWithId[]> => {
  return await request("sells/", "GET")
}

export const postSell = async (sell: Sell): Promise<SellWithId> => {
  return await request("sells/", "POST", sell)
}

export const deleteSellById = async (id: string) => {
  await request(`sells/${id}`, "DELETE", id)
}
