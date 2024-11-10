const BASE_URL = import.meta.env.VITE_SERVER_URL

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const request = async (url: string, method: string, body?: any) => {
  const res = await fetch(`${BASE_URL}/${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch data from ${url}`)
  }
  if (res.headers.get("content-length") === "0") {
    return null
  }

  return await res.json()
}

export const rawRequest = async (url: string, method: string, body?: string) => {
  return await fetch(`${BASE_URL}/${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body,
  })
}
