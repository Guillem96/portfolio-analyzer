import { useBoundStore } from "@/store"
import {
  RiDashboard3Line,
  RiEyeLine,
  RiEyeOffLine,
  RiLogoutCircleLine,
  RiSettingsLine,
} from "@remixicon/react"
import LightDarkThemeSwitch from "./LightDarkThemeSwitch"
import { IconTooltipButton } from "./IconTooltipButton"

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

  return (
    <div className="flex w-full flex-row justify-end gap-2 p-4">
      {inSettingsScreen ? (
        <IconTooltipButton
          tooltip="Back to dashboard"
          icon={RiDashboard3Line}
          onClick={() => setInSettingsScreen(false)}
        />
      ) : null}
      <IconTooltipButton
        tooltip="Open settings screen"
        icon={RiSettingsLine}
        disabled={inSettingsScreen}
        onClick={() => setInSettingsScreen(true)}
      />
      <LightDarkThemeSwitch />
      <IconTooltipButton
        tooltip="Toggle private mode"
        icon={privateMode ? RiEyeOffLine : RiEyeLine}
        onClick={togglePrivateMode}
      />
      {user !== null ? (
        <IconTooltipButton tooltip="Logout" icon={RiLogoutCircleLine} onClick={() => logout()} />
      ) : null}
      {user !== null ? (
        <img alt={`${user.name} avatar`} src={user.picture} className="size-10 rounded-full" />
      ) : null}
    </div>
  )
}
