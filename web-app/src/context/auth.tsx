import { useBoundStore } from "@/store"
import { ReactNode } from "react"
import { AuthContext } from "./index"

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user] = useBoundStore((state) => [state.user])
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}
