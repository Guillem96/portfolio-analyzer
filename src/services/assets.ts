import type { Asset, AssetWithId, JSONBinSettings } from "@/types.d"
import { addElementToList, deleteElementFromListById, editElementFromList, fetchList, updateList } from "./jsonbin"

const LIST_NAME = "assets"

export const fetchAssets = async (settings: JSONBinSettings): Promise<AssetWithId[]> => {
  return await fetchList<AssetWithId>(LIST_NAME, settings)
}

export const updateAssets = async (assets: AssetWithId[], settings: JSONBinSettings) => {
  await updateList(LIST_NAME, assets, settings)
}

export const postAsset = async (asset: Asset, settings: JSONBinSettings): Promise<AssetWithId> => {
  return await addElementToList<Asset>(LIST_NAME, asset, settings)
}

export const editAsset = async (asset: AssetWithId, settings: JSONBinSettings): Promise<AssetWithId> => {
  return await editElementFromList(LIST_NAME, asset, settings)
}

export const deleteAssetById = async (id: string, settings: JSONBinSettings) => {
  await deleteElementFromListById(LIST_NAME, id, settings)
}
