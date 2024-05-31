import { ToastContainer } from "react-toastify"
import { useBoundStore } from "@/store"
import Settings from "@features/Settings"
import Dashboard from "@features/Dashboard"
import Controls from "./components/Controls"
import { useEffect } from "react"

function App() {
  const [jsonBinAccessKey, jsonBinId, inSettingsScreen, darkMode] = useBoundStore((state) => [
    state.jsonBinAccessKey,
    state.jsonBinId,
    state.inSettingsScreen,
    state.darkMode,
  ])

  useEffect(() => {
    const $body = document.querySelector("body")
    if (!$body) return
    if (darkMode && !$body.classList.contains("dark")) $body.classList.add("dark")
    if (darkMode && !$body.classList.contains("bg-gray-950")) $body.classList.add("bg-gray-950")
    if (!darkMode && $body.classList.contains("dark")) $body.classList.remove("dark")
    if (!darkMode && $body.classList.contains("bg-gray-950")) $body.classList.remove("bg-gray-950")
  }, [darkMode])

  const inSettings = jsonBinAccessKey == null || jsonBinId == null || inSettingsScreen
  return (
    <>
      <Controls />
      {inSettings ? (
        <div className="grid min-h-screen content-center">
          <Settings />
        </div>
      ) : (
        <Dashboard />
      )}
      <ToastContainer />
    </>
  )
}

export default App
