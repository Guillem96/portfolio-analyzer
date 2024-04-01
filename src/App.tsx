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
    if (darkMode && !$body?.classList.contains("dark")) document.querySelector("body")?.classList.add("dark")

    if (!darkMode && $body?.classList.contains("dark")) document.querySelector("body")?.classList.remove("dark")
  }, [darkMode])

  const inSettings = jsonBinAccessKey == null || jsonBinId == null || inSettingsScreen
  return (
    <>
      <Controls />
      {inSettings ? (
        <div className="grid content-center min-h-screen">
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
