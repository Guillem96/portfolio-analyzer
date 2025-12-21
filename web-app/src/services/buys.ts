import type { Buy, BuyWithId } from "@/types.d"
import { request } from "./base"

export const fetchBuys = async (): Promise<BuyWithId[]> => {
  return await request("buys/", "GET")
}

export const postBuy = async (buy: Buy): Promise<BuyWithId> => {
  return await request("buys/", "POST", buy)
}

export const deleteBuyById = async (id: string) => {
  await request(`buys/${id}`, "DELETE", id)
}
