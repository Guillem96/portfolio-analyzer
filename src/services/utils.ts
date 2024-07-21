import { CurrencyType } from "@/types"
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

export const currencyFormatter = (number: number, currency: CurrencyType, privateMode: boolean): string => {
  if (privateMode) {
    if (currency === "£") return "***£"
    if (currency === "€") return "***€"
    return "$***"
  }

  const numberOptions = { maximumFractionDigits: 2, minimumFractionDigits: 2 }
  if (currency === "£") return Intl.NumberFormat("en-UK", numberOptions).format(number).toString() + "£"
  if (currency === "$") return "$" + Intl.NumberFormat("en-US", numberOptions).format(number).toString()
  return Intl.NumberFormat("eu", numberOptions).format(number).toString() + "€"
}

export const getWebsiteLogo = (website: string | null) => {
  if (website == null) return "https://img.logo.dev/img.logo.dev/?token=pk_IwxdehLNSrC8oUQwnLTYjw"

  const noSchemaWebsite = website.replace("https://", "")
  const slashIdx = noSchemaWebsite.indexOf("/")
  if (slashIdx === -1) return `https://img.logo.dev/${noSchemaWebsite}?token=pk_IwxdehLNSrC8oUQwnLTYjw`

  const noPathWebsite = noSchemaWebsite.substring(0, noSchemaWebsite.indexOf("/") + 1)
  return `https://img.logo.dev/${noPathWebsite}?token=pk_IwxdehLNSrC8oUQwnLTYjw`
}
