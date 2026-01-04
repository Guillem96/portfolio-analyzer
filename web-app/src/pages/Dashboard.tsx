import { useBoundStore } from "@/store"
import { useEffect } from "react"
import Dashboard from "@features/Dashboard"

export default function DashboardPage() {
  const [
    fetchAssets,
    fetchSells,
    fetchBuys,
    fetchDividends,
    fetchDividendsPreferredCurrency,
    user,
    setInSettingsScreen,
  ] = useBoundStore((state) => [
    state.fetchAssets,
    state.fetchSells,
    state.fetchBuys,
    state.fetchDividends,
    state.fetchDividendsPreferredCurrency,
    state.user,
    state.setInSettingsScreen,
  ])

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchBuys(), fetchSells(), fetchDividends(), fetchDividendsPreferredCurrency(), fetchAssets()])
    }

    if (!user) {
      setInSettingsScreen(true)
      return
    }

    fetchData().catch((error) => {
      console.error(error)
    })
  }, [user])

  return (
    <>
      <Dashboard />
    </>
  )
}
