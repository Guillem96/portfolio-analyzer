import { ToastContainer } from "react-toastify"
import { useBoundStore } from "@/store"
import Settings from "./pages/Settings"
import { useEffect, useState } from "react"
import SignUp from "./pages/SignUp"
import DashboardPage from "./pages/Dashboard"
import { RiTimeLine } from "@remixicon/react"
import { AuthProvider } from "./context/auth"
import Controls from "@components/Controls"
import { Spinner } from "@/components/ui/spinner"

function App() {
  const [appLoading, setAppLoading] = useState(true)
  const [inSettingsScreen, darkMode, user, login] = useBoundStore((state) => [
    state.inSettingsScreen,
    state.darkMode,
    state.user,
    state.login,
  ])

  useEffect(() => {
    const $body = document.querySelector("body")
    if (!$body) return
    if (darkMode) {
      $body.classList.add("dark")
    } else {
      $body.classList.remove("dark")
    }
  }, [darkMode])

  useEffect(() => {
    setAppLoading(true)
    login()
      .catch((error) => {
        setAppLoading(false)
        console.error(error)
      })
      .finally(() => {
        setAppLoading(false)
      })
  }, [])

  if (appLoading) {
    return (
      <div className="grid min-h-dvh content-center justify-items-center gap-4 text-center">
        <Spinner className="size-8" />
        <p className="text-xl text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <SignUp />
  }

  return (
    <AuthProvider>
      <Controls />

      {inSettingsScreen ? (
        <div className="grid min-h-dvh content-center">
          <Settings />
        </div>
      ) : (
        <DashboardPage />
      )}
      <ToastContainer />
    </AuthProvider>
  )
}

export default App
