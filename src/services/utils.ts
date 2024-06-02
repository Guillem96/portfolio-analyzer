import { toast } from "react-toastify"

type ErrorWithMessage = {
  message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

export const getErrorMessage = (error: unknown) => {
  return toErrorWithMessage(error).message
}

export const showErrorToast = (message: string, onClose: () => void) => {
  toast.error(message, {
    autoClose: 3000,
    position: "bottom-center",
    draggable: true,
    onClose: onClose,
  })
}

export const currencyFormatter = (number: number, currency: "$" | "€", privateMode: boolean): string => {
  if (privateMode) return currency === "$" ? "$***" : "***€"
  const numberOptions = { maximumFractionDigits: 2, minimumFractionDigits: 2 }
  if (currency === "$") return "$" + Intl.NumberFormat("us", numberOptions).format(number).toString()
  return Intl.NumberFormat("eu", numberOptions).format(number).toString() + "€"
}
