import { ToastContainer } from "react-toastify"
import { useBoundStore } from "@/store"
import Settings from "@features/Settings"
import Dashboard from "@features/Dashboard"
import Controls from "./components/Controls"
import { useEffect, useState } from "react"
import { Icon } from "@tremor/react"
import { RiTimeLine } from "@remixicon/react"

function App() {
  const [appLoading, setAppLoading] = useState(true)

  const [jsonBinAccessKey, jsonBinId, inSettingsScreen, darkMode] = useBoundStore((state) => [
    state.jsonBinAccessKey,
    state.jsonBinId,
    state.inSettingsScreen,
    state.darkMode,
  ])

  const [buys, fetchAssets, fetchBuys, fetchTickers, fetchDividends] = useBoundStore((state) => [
    state.buys,
    state.fetchAssets,
    state.fetchBuys,
    state.fetchTickers,
    state.fetchDividends,
  ])

  useEffect(() => {
    if (jsonBinAccessKey == null || jsonBinId == null) return
    setAppLoading(true)
    const fetchData = async () => {
      await fetchBuys()
      await fetchDividends()
    }

    fetchData().catch((error) => {
      setAppLoading(false)
      console.error(error)
    })
  }, [jsonBinAccessKey, jsonBinId])

  useEffect(() => {
    setAppLoading(false)
    fetchTickers()
      .then(fetchAssets)
      .finally(() => setAppLoading(false))
  }, [buys])

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
      {appLoading ? (
        <div className="grid min-h-dvh content-center text-center text-xl">
          <Icon size="xl" icon={RiTimeLine} />
          <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
        </div>
      ) : null}
      {!appLoading && inSettings ? (
        <div className="grid min-h-dvh content-center">
          <Settings />
        </div>
      ) : null}
      {!appLoading && !inSettings ? <Dashboard /> : null}
      <ToastContainer />
    </>
  )
}

export default App
