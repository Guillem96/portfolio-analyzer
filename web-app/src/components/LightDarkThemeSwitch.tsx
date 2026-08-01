import { useBoundStore } from "@/store"
import { RiMoonLine, RiSunLine } from "@remixicon/react"
import { IconTooltipButton } from "./IconTooltipButton"

export default function LightDarkThemeSwitch() {
  const [darkMode, toggleDarkMode] = useBoundStore((state) => [state.darkMode, state.toggleDarkMode])

  return (
    <IconTooltipButton
      tooltip="Toggle dark mode"
      icon={darkMode ? RiSunLine : RiMoonLine}
      onClick={toggleDarkMode}
    />
  )
}
