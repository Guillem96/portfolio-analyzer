import { MONTHS } from "@/constants"
import { useBoundStore } from "@/store"
import { Dividend } from "@/types"
import { useMemo } from "react"

const useDividendsPerYear = (
  dividends: Dividend[],
  dividendLoading: boolean,
): { date: number; "Dividend Earnings": number }[] => {
  return useMemo(() => {
    if (dividends.length === 0 || dividendLoading) return []

    const invWithDate = dividends.map((div) => {
      return { ...div, date: new Date(div.date) }
    })

    const startingYear = new Date().getFullYear() - 4
    const data = new Array(5).fill(undefined).map((_, i) => {
      return {
        date: startingYear + i,
        "Dividend Earnings": 0,
      }
    })

    invWithDate.forEach(({ date, amount }) => {
      data[date.getFullYear() - startingYear]["Dividend Earnings"] += amount
    })

    return data
  }, [dividends, dividendLoading])
}

const useDividendsPerMonth = (
  dividends: Dividend[],
  dividendLoading: boolean,
): { date: string; [x: number]: number }[] => {
  const year = new Date().getFullYear()
  const data = useMemo(() => {
    if (dividends.length === 0 || dividendLoading) return []

    const invWithDate = dividends.map((div) => {
      return { ...div, date: new Date(div.date) }
    })

    const currInv = invWithDate.filter(({ date }) => date.getFullYear() === year || date.getFullYear() - 1)

    const barData = MONTHS.map((month) => ({ date: month, [year]: 0, [year - 1]: 0 }))

    currInv.forEach(({ date, amount }) => {
      barData[date.getMonth()][date.getFullYear()] += amount
    })

    return barData
  }, [dividends, dividendLoading])
  return data
}

export const useDividedsStats = () => {
  const [assets, dividends, dividendLoading] = useBoundStore((state) => [
    state.assets,
    state.dividendsPreferredCurrency,
    state.dividendLoading,
  ])

  const totalInvested = useMemo(() => assets.map(({ buyValue }) => buyValue).reduce((a, b) => a + b, 0), [assets])
  const totalAssetValue = useMemo(() => assets.map(({ value }) => value).reduce((a, b) => a + b, 0), [assets])

  const nextYearDividends = useMemo(
    () => assets.map(({ ticker, units }) => (ticker.yearlyDividendValue || 0) * units).reduce((a, b) => a + b, 0),
    [assets],
  )

  const dividendsPerYear = useDividendsPerYear(dividends, dividendLoading)
  const dividendsPerMonth = useDividendsPerMonth(dividends, dividendLoading)
  const leftDividendsYear = useMemo(
    () =>
      assets
        .map(({ ticker, units }) => ({
          exDividendDate: ticker.exDividendDate,
          expectedAmount: (ticker.nextDividendValue || 0) * units,
        }))
        .filter(
          ({ exDividendDate }) =>
            exDividendDate >= new Date() && exDividendDate.getFullYear() === new Date().getFullYear(),
        )
        .map(({ expectedAmount }) => expectedAmount)
        .reduce((a, b) => a + b, 0),
    [assets],
  )

  const pendingToReinvest = useMemo(
    () =>
      dividends
        .filter(({ isReinvested }) => !isReinvested)
        .map(
          ({ amount, doubleTaxationDestination, doubleTaxationOrigin }) =>
            amount * (1 - doubleTaxationOrigin / 100) * (1 - doubleTaxationDestination / 100),
        )
        .reduce((a, b) => a + b, 0),
    [dividends],
  )

  return {
    nextYearDividends,
    yieldWithRespectToInvested: ((nextYearDividends / totalInvested) * 100).toFixed(2),
    yieldWithRespectToAssetValue: ((nextYearDividends / totalAssetValue) * 100).toFixed(2),
    dividendsPerYear,
    dividendsPerMonth,
    leftDividendsYear,
    meanMonthlyAverage: nextYearDividends / 12,
    pendingToReinvest,
  }
}
