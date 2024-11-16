import { useBoundStore } from "@/store"
import { RiTimeLine } from "@remixicon/react"
import { Icon } from "@tremor/react"
import { useEffect, useState } from "react"
import Dashboard from "@features/Dashboard"

export default function DashboardPage() {
  const [appLoading, setAppLoading] = useState(true)

  const [fetchAssets, fetchBuys, fetchTickers, fetchDividends, fetchDividendsPreferredCurrency, user, setInSettingsScreen] = useBoundStore((state) => [
    state.fetchAssets,
    state.fetchBuys,
    state.fetchTickers,
    state.fetchDividends,
    state.fetchDividendsPreferredCurrency,
    state.user,
    state.setInSettingsScreen,
  ])

  useEffect(() => {
    setAppLoading(true)
    const fetchData = async () => {
      await Promise.all([
        fetchBuys(),
        fetchDividends(),
        fetchDividendsPreferredCurrency(),
        fetchAssets(),
      ])
      await fetchTickers()
    }

    if (!user) {
      setInSettingsScreen(true)
      setAppLoading(false)
      return
    }

    fetchData()
      .catch((error) => {
        setAppLoading(false)
        console.error(error)
      })
      .finally(() => {
        setAppLoading(false)
      })
  }, [user])

  return (
    <>
      {appLoading ? (
        <div className="grid min-h-dvh content-center text-center text-xl">
          <Icon size="xl" icon={RiTimeLine} />
          <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
        </div>
      ) : (
        <Dashboard />
      )}
    </>
  )
}
