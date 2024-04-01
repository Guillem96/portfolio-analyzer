import { useBoundStore } from "@/store"
import { RiMoonLine, RiSettingsLine, RiSunLine } from "@remixicon/react"
import { Button } from "@tremor/react"

export default function Control() {
  const [inSettingsScreen, setInSettingsScreen, darkMode, toggleDarkMode] = useBoundStore((state) => [
    state.inSettingsScreen,
    state.setInSettingsScreen,
    state.darkMode,
    state.toggleDarkMode,
  ])

  const isSettingsDisabled = inSettingsScreen == null

  return (
    <div className="flex flex-row justify-end w-full p-4 gap-x-4">
      <Button
        variant="light"
        disabled={isSettingsDisabled}
        size="lg"
        icon={RiSettingsLine}
        onClick={() => setInSettingsScreen(true)}
      />
      <Button variant="light" size="lg" icon={darkMode ? RiSunLine : RiMoonLine} onClick={toggleDarkMode} />
    </div>
  )
}
