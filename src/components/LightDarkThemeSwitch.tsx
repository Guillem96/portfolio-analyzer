import { useBoundStore } from "@/store"
import { RiMoonLine, RiSunLine } from "@remixicon/react"
import { Button } from "@tremor/react"

export default function LightDarkThemeSwitch() {
  const [darkMode, toggleDarkMode] = useBoundStore((state) => [state.darkMode, state.toggleDarkMode])
  return (
    <>
      <Button
        variant="light"
        tooltip="Toggle dark mode"
        size="lg"
        icon={darkMode ? RiSunLine : RiMoonLine}
        onClick={toggleDarkMode}
      />
    </>
  )
}
