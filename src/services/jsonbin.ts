import type { JSONBin, JSONBinSettings } from "@/types.d"

const buildUrl = ({ binId }: JSONBinSettings) => `https://api.jsonbin.io/v3/b/${binId}`

export const fetchAllBin = async (settings: JSONBinSettings): Promise<JSONBin> => {
  const response = await fetch(buildUrl(settings), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": settings.accessKey,
    },
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error("Failed to fetch investments.")
  }

  return json?.record as JSONBin
}

export const fetchList = async <T>(listName: string, settings: JSONBinSettings): Promise<T[]> => {
  const response = await fetch(buildUrl(settings), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": settings.accessKey,
      "X-JSON-Path": listName,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch investments.")
  }

  const json = await response.json()
  return json?.record[0] as T[]
}

export const updateList = async (listName: string, elements: unknown[], settings: JSONBinSettings) => {
  const allBin = await fetchAllBin(settings)

  // @ts-expect-error accessing an arbitrary field
  allBin[listName] = elements

  const response = await fetch(buildUrl(settings), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": settings.accessKey,
    },
    body: JSON.stringify(allBin),
  })

  if (!response.ok) {
    throw new Error(`Failed to upload ${listName} elements.`)
  }
}

export const addElementToList = async <T>(
  listName: string,
  element: T,
  settings: JSONBinSettings,
): Promise<T & { id: string }> => {
  const allBin = await fetchAllBin(settings)
  const newElement = { ...element, id: crypto.randomUUID() }

  // @ts-expect-error accessing arbitrary property
  allBin[listName] = (allBin[listName] ?? []).concat([newElement])

  const response = await fetch(buildUrl(settings), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": settings.accessKey,
    },
    body: JSON.stringify(allBin),
  })

  if (!response.ok) {
    throw new Error(`Failed to post in ${listName}.`)
  }

  return newElement
}

export const editElementFromList = async <T>(
  listName: string,
  element: T & { id: string },
  settings: JSONBinSettings,
): Promise<T & { id: string }> => {
  const allBin = await fetchAllBin(settings)

  // @ts-expect-error accessing arbitrary property
  const idx = allBin[listName].findIndex(({ id }) => id === element.id)
  if (idx === -1) {
    throw Error(`Element not found in ${listName}...`)
  }

  // @ts-expect-error accessing arbitrary property
  allBin[listName] = (allBin[listName] ?? []).map((elem) => {
    if (elem.id === element.id) return { ...elem, ...element }
    return elem
  })

  const response = await fetch(buildUrl(settings), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": settings.accessKey,
    },
    body: JSON.stringify(allBin),
  })

  if (!response.ok) {
    throw new Error(`Failed to edit in ${listName}.`)
  }

  return element
}

export const deleteElementFromListById = async (listName: string, id: string, settings: JSONBinSettings) => {
  const allBin = await fetchAllBin(settings)

  // @ts-expect-error accessing arbitrary property
  if (!allBin[listName]) return

  // @ts-expect-error accessing arbitrary property
  allBin[listName] = allBin[listName].filter((inv) => inv.id !== id)

  const response = await fetch(buildUrl(settings), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": settings.accessKey,
    },
    body: JSON.stringify(allBin),
  })

  if (!response.ok) {
    throw new Error(`Failed to delete ${id} from ${listName}.`)
  }
}
