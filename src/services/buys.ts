import type { Buy, BuyWithId, JSONBinSettings } from "@/types.d"
import { addElementToList, deleteElementFromListById, fetchList, updateList } from "./jsonbin"

const LIST_NAME = "buys"

export const fetchBuys = async (settings: JSONBinSettings): Promise<BuyWithId[]> => {
  return await fetchList<BuyWithId>(LIST_NAME, settings)
}

export const updateBuys = async (buys: BuyWithId[], settings: JSONBinSettings) => {
  await updateList(LIST_NAME, buys, settings)
}

export const postBuy = async (buy: Buy, settings: JSONBinSettings): Promise<BuyWithId> => {
  return await addElementToList<Buy>(LIST_NAME, buy, settings)
}

export const deleteBuyById = async (id: string, settings: JSONBinSettings) => {
  await deleteElementFromListById(LIST_NAME, id, settings)
}
