import { User } from "@/types"
import { createContext } from "react"

export const AuthContext = createContext<{ user: User | null }>({ user: null })
