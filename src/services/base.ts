const BASE_URL = "http://localhost:8080/"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const request = async (url: string, method: string, body?: any) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
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
