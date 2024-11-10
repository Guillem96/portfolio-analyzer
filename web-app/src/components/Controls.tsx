import { useBoundStore } from "@/store"
import { RiDashboard3Line, RiEyeLine, RiEyeOffLine, RiLogoutCircleLine, RiSettingsLine } from "@remixicon/react"
import { Button } from "@tremor/react"
import LightDarkThemeSwitch from "./LightDarkThemeSwitch"

export default function Control() {
  const [user, logout, inSettingsScreen, setInSettingsScreen, privateMode, togglePrivateMode] = useBoundStore(
    (state) => [
      state.user,
      state.logout,
      state.inSettingsScreen,
      state.setInSettingsScreen,
      state.privateMode,
      state.togglePrivateMode,
    ],
  )

  const handleLogout = () => {
    logout()
  }

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
      <LightDarkThemeSwitch />
      <Button
        variant="light"
        tooltip="Toggle private mode"
        size="lg"
        icon={privateMode ? RiEyeOffLine : RiEyeLine}
        onClick={togglePrivateMode}
      />
      {user !== null ? (
        <Button variant="light" tooltip="Logout" size="lg" icon={RiLogoutCircleLine} onClick={handleLogout} />
      ) : null}
      {user !== null ? <img alt={`${user.name} avatar`} src={user.picture} className="w-10 rounded-full" /> : null}
    </div>
  )
}
