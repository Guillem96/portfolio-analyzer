import { ToastContainer } from "react-toastify"
import { useBoundStore } from "@/store"
import Settings from "./pages/Settings"
import { useEffect, useState } from "react"
import SignUp from "./pages/SignUp"
import DashboardPage from "./pages/Dashboard"
import { Icon } from "@tremor/react"
import { RiTimeLine } from "@remixicon/react"
import { AuthProvider } from "./context/auth"
import Controls from "@components/Controls"

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
    if (darkMode && !$body.classList.contains("dark")) $body.classList.add("dark")
    if (darkMode && !$body.classList.contains("bg-gray-950")) $body.classList.add("bg-gray-950")
    if (!darkMode && $body.classList.contains("dark")) $body.classList.remove("dark")
    if (!darkMode && $body.classList.contains("bg-gray-950")) $body.classList.remove("bg-gray-950")
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
      <div className="grid min-h-dvh content-center text-center text-xl">
        <Icon size="xl" icon={RiTimeLine} />
        <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
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
