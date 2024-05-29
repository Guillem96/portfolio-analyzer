import { useMemo } from "react"
import { RiArrowLeftDoubleLine, RiArrowRightDoubleLine, RiSkipLeftLine, RiSkipRightLine } from "@remixicon/react"
import { Button } from "@tremor/react"

interface Props {
  nPages: number
  currentPage: number
  maxPagesToShow: number
  onPageNavigation: (newPage: number) => void
}

export default function PaginationNav({ nPages, currentPage, maxPagesToShow, onPageNavigation }: Props) {
  const pageButtons = useMemo(() => {
    if (nPages <= 1) return []

    const pagesToShow = [currentPage]
    for (let left = 1; left < maxPagesToShow && pagesToShow.length < maxPagesToShow; left++) {
      if (currentPage - left > 0) pagesToShow.push(currentPage - left)

      if (currentPage + left <= nPages && pagesToShow.length < maxPagesToShow) pagesToShow.push(currentPage + left)
    }
    pagesToShow.sort()

    const leading = (
      <>
        <Button
          key="first-page-btn"
          variant="light"
          onClick={() => onPageNavigation(1)}
          disabled={currentPage === 1}
          icon={RiSkipLeftLine}
        ></Button>
        <Button
          key="leading-btn"
          variant="light"
          onClick={() => onPageNavigation(currentPage - 1)}
          disabled={pagesToShow[0] == 1}
          icon={RiArrowLeftDoubleLine}
        ></Button>
      </>
    )

    const trailing = (
      <>
        <Button
          key="trailing-btn"
          variant="light"
          onClick={() => onPageNavigation(currentPage + 1)}
          icon={RiArrowRightDoubleLine}
          disabled={pagesToShow[pagesToShow.length - 1] === nPages}
        ></Button>
        <Button
          key="last-page-btn"
          variant="light"
          onClick={() => onPageNavigation(nPages)}
          disabled={currentPage === nPages}
          icon={RiSkipRightLine}
        ></Button>
      </>
    )

    return [leading]
      .concat(
        pagesToShow.map((i) =>
          i === currentPage ? (
            <Button key={i} className="pointer-events-none" variant="primary" onClick={() => {}}>
              {i.toString()}
            </Button>
          ) : (
            <Button key={i} variant="secondary" onClick={() => onPageNavigation(i)}>
              {i.toString()}
            </Button>
          ),
        ),
      )
      .concat([trailing])
  }, [currentPage, nPages, maxPagesToShow, onPageNavigation])

  return nPages > 1 ? <div className="flex flex-row justify-center gap-x-2">{pageButtons}</div> : null
}
