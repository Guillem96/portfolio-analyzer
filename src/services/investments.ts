import type { Investment, InvestmentWithId, JSONBinSettings } from "@/types.d"
import { addElementToList, deleteElementFromListById, fetchList, updateList } from "./jsonbin"

const LIST_NAME = "investments"

export const fetchInvestments = async (settings: JSONBinSettings): Promise<InvestmentWithId[]> => {
  return await fetchList<InvestmentWithId>(LIST_NAME, settings)
}

export const updateInvestments = async (investments: InvestmentWithId[], settings: JSONBinSettings) => {
  await updateList(LIST_NAME, investments, settings)
}

export const postInvestment = async (investment: Investment, settings: JSONBinSettings): Promise<InvestmentWithId> => {
  return await addElementToList<Investment>(LIST_NAME, investment, settings)
}

export const deleteInvestmentById = async (id: string, settings: JSONBinSettings) => {
  await deleteElementFromListById(LIST_NAME, id, settings)
}
