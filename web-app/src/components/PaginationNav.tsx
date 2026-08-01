import { useMemo } from "react"
import {
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiSkipLeftLine,
  RiSkipRightLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"

interface Props {
  nPages: number
  currentPage: number
  maxPagesToShow: number
  onPageNavigation: (newPage: number) => void
}

export default function PaginationNav({ nPages, currentPage, maxPagesToShow, onPageNavigation }: Props) {
  const pageButtons = useMemo(() => {
    if (nPages <= 1) return []

    let activePage = currentPage
    if (activePage < 0) {
      activePage = nPages + activePage + 1
    }

    const pagesToShow = [activePage]
    for (let left = 1; left < maxPagesToShow && pagesToShow.length < maxPagesToShow; left++) {
      if (activePage - left > 0) pagesToShow.push(activePage - left)

      if (activePage + left <= nPages && pagesToShow.length < maxPagesToShow) pagesToShow.push(activePage + left)
    }
    pagesToShow.sort((a, b) => a - b)

    const leading = [
      <Button
        key="first-page-btn"
        variant="ghost"
        size="icon"
        onClick={() => onPageNavigation(1)}
        disabled={activePage === 1}
      >
        <RiSkipLeftLine />
      </Button>,
      <Button
        key="leading-btn"
        variant="ghost"
        size="icon"
        onClick={() => onPageNavigation(activePage - 1)}
        disabled={pagesToShow[0] === 1}
      >
        <RiArrowLeftDoubleLine />
      </Button>,
    ]

    const trailing = [
      <Button
        key="trailing-btn"
        variant="ghost"
        size="icon"
        onClick={() => onPageNavigation(activePage + 1)}
        disabled={pagesToShow[pagesToShow.length - 1] === nPages}
      >
        <RiArrowRightDoubleLine />
      </Button>,
      <Button
        key="last-page-btn"
        variant="ghost"
        size="icon"
        onClick={() => onPageNavigation(nPages)}
        disabled={activePage === nPages}
      >
        <RiSkipRightLine />
      </Button>,
    ]

    return leading
      .concat(
        pagesToShow.map((page) =>
          page === activePage ? (
            <Button key={page} className="pointer-events-none" variant="default">
              {page.toString()}
            </Button>
          ) : (
            <Button key={page} variant="secondary" onClick={() => onPageNavigation(page)}>
              {page.toString()}
            </Button>
          ),
        ),
      )
      .concat(trailing)
  }, [currentPage, nPages, maxPagesToShow, onPageNavigation])

  return nPages > 1 ? <div className="flex flex-row justify-center gap-2">{pageButtons}</div> : null
}
