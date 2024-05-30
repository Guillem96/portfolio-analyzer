import type { Dividend, DividendWithId, JSONBinSettings } from "@/types.d"
import { addElementToList, deleteElementFromListById, fetchList, updateList } from "./jsonbin"

const LIST_NAME = "dividends"

export const fetchDividends = async (settings: JSONBinSettings): Promise<DividendWithId[]> => {
  return await fetchList<DividendWithId>(LIST_NAME, settings)
}

export const updateDividends = async (dividends: DividendWithId[], settings: JSONBinSettings) => {
  await updateList(LIST_NAME, dividends, settings)
}

export const postDividend = async (dividend: Dividend, settings: JSONBinSettings): Promise<DividendWithId> => {
  return await addElementToList<Dividend>(LIST_NAME, dividend, settings)
}

export const deleteDividendById = async (id: string, settings: JSONBinSettings) => {
  await deleteElementFromListById(LIST_NAME, id, settings)
}
