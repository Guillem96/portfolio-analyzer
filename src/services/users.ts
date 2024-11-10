import { CurrencyType, User } from "@/types"
import { rawRequest, request } from "./base"

export const fetchCurrentUser = async () => {
  const res = await rawRequest("auth/user", "GET")
  if (res.status === 401 || res.status === 404) {
    return null
  }

  if (!res.ok) {
    throw new Error("Failed to fetch user data")
  }

  return (await res.json()) as User
}

export const updatePreferences = async (preferredCurrency: CurrencyType) => {
  await request("auth/user", "PATCH", { preferredCurrency })
}

export const logout = async () => {
  await request("auth/logout", "GET")
}
