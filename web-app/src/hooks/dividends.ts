import { MONTHS } from "@/constants"
import { useBoundStore } from "@/store"
import { Asset, Dividend } from "@/types"
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

    const allYears = [...new Set(invWithDate.map(({ date }) => date.getFullYear()))]

    const data = allYears.map((year) => {
      return {
        date: year,
        "Dividend Earnings": 0,
      }
    })

    invWithDate.forEach(({ date, amount }) => {
      data[date.getFullYear() - allYears[0]]["Dividend Earnings"] += amount
    })

    return data
  }, [dividends, dividendLoading])
}

const useDividendsPerMonth = (
  dividends: Dividend[],
  dividendLoading: boolean,
): { date: string; [x: number]: number }[] => {
  const year = new Date().getFullYear()
  const startYear = year - 3

  const data = useMemo(() => {
    if (dividends.length === 0 || dividendLoading) return []

    const invWithDate = dividends.map((div) => {
      return { ...div, date: new Date(div.date) }
    })

    const currInv = invWithDate.filter(({ date }) => date.getFullYear() >= startYear)

    // Dynamically generate columns for each year in the range [startYear, year]
    const years = Array.from({ length: year - startYear + 1 }, (_, i) => startYear + i)
    const barData = MONTHS.map((month) => {
      const entry: { date: string; [key: number]: number } = { date: month }
      years.forEach((y) => {
        entry[y] = 0
      })
      return entry
    })

    currInv.forEach(({ date, amount }) => {
      barData[date.getMonth()][date.getFullYear()] += amount
    })

    // Filter out years (columns) where all values are 0
    const yearsToKeep = years.filter((y) => barData.some((row) => row[y] !== 0))
    return barData.map((row) => {
      const filteredRow: { date: string; [key: number]: number } = { date: row.date }
      yearsToKeep.forEach((y) => {
        filteredRow[y] = row[y]
      })
      return filteredRow
    })
  }, [dividends, dividendLoading])
  return data
}

const useDividendsPerTickerPct = (assets: Asset[]) => {
  return useMemo(() => {
    const totalDividends = assets
      .map(({ ticker, units }) => (ticker.yearlyDividendValue || 0) * units)
      .reduce((a, b) => a + b, 0)

    return assets
      .map(({ ticker, units }) => ({
        dividend: (ticker.yearlyDividendValue || 0) * units,
        pct: ((ticker.yearlyDividendValue || 0) * units) / totalDividends,
        tickerName: ticker.ticker,
        ticker,
      }))
      .sort((a, b) => b.pct - a.pct)
  }, [assets])
}

export const useDividedsStats = () => {
  const [assets, dividends, dividendLoading, dividendsPreferredCurrencyLoading] = useBoundStore((state) => [
    state.assets,
    state.dividendsPreferredCurrency,
    state.dividendLoading,
    state.dividendsPreferredCurrencyLoading,
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
    yearlyDividendsPerTicker: useDividendsPerTickerPct(assets),
    yieldWithRespectToInvested: ((nextYearDividends / totalInvested) * 100).toFixed(2),
    yieldWithRespectToAssetValue: ((nextYearDividends / totalAssetValue) * 100).toFixed(2),
    dividendsPerYear,
    dividendsPerMonth,
    leftDividendsYear,
    meanMonthlyAverage: nextYearDividends / 12,
    pendingToReinvest,
    loading: dividendLoading || dividendsPreferredCurrencyLoading,
  }
}
