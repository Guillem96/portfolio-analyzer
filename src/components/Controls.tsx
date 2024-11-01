import { useBoundStore } from "@/store"
import { RiDashboard3Line, RiEyeLine, RiEyeOffLine, RiMoonLine, RiSettingsLine, RiSunLine } from "@remixicon/react"
import { Button } from "@tremor/react"

export default function Control() {
  const [inSettingsScreen, setInSettingsScreen, darkMode, toggleDarkMode, privateMode, togglePrivateMode] =
    useBoundStore((state) => [
      state.inSettingsScreen,
      state.setInSettingsScreen,
      state.darkMode,
      state.toggleDarkMode,
      state.privateMode,
      state.togglePrivateMode,
    ])

  return (
    <div className="flex w-full flex-row justify-end gap-x-4 p-4">
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
      <Button
        variant="light"
        tooltip="Toggle private mode"
        size="lg"
        icon={privateMode ? RiEyeOffLine : RiEyeLine}
        onClick={togglePrivateMode}
      />
      <Button
        variant="light"
        tooltip="Login"
        size="lg"
        icon={RiSunLine}
        onClick={() => {
          window.location.href = "http://localhost:8080/auth/google/login"
        }}
      />
    </div>
  )
}
