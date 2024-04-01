import { useBoundStore } from "@/store"
import { RiDashboard3Line, RiMoonLine, RiSettingsLine, RiSunLine } from "@remixicon/react"
import { Button } from "@tremor/react"

export default function Control() {
  const [inSettingsScreen, setInSettingsScreen, darkMode, toggleDarkMode] = useBoundStore((state) => [
    state.inSettingsScreen,
    state.setInSettingsScreen,
    state.darkMode,
    state.toggleDarkMode,
  ])

  return (
    <div className="flex flex-row justify-end w-full p-4 gap-x-4">
      {inSettingsScreen ? (
        <Button
          variant="light"
          tooltip="Back to dashboard"
          size="lg"
          icon={RiDashboard3Line}
          onClick={() => setInSettingsScreen(false)}
        />
      ) : null}
      <Button
        variant="light"
        disabled={inSettingsScreen}
        size="lg"
        tooltip="Open settings screen"
        icon={RiSettingsLine}
        onClick={() => setInSettingsScreen(true)}
      />
      <Button
        variant="light"
        tooltip="Toggle dark mode"
        size="lg"
        icon={darkMode ? RiSunLine : RiMoonLine}
        onClick={toggleDarkMode}
      />
    </div>
  )
}
