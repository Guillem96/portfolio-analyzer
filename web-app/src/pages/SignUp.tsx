import LightDarkThemeSwitch from "@/components/LightDarkThemeSwitch"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RiDashboard3Line, RiGoogleFill } from "@remixicon/react"

export default function SignUp() {
  const loginUrl = import.meta.env.VITE_SERVER_URL + "/auth/google/login"
  return (
    <section className="relative flex h-screen items-center justify-center px-4">
      <div className="absolute right-5 top-5 z-10">
        <LightDarkThemeSwitch />
      </div>
      <img src="/portfolio-analyzer/signup.webp" className="absolute top-0 h-full w-full opacity-20" alt="" />
      <Card className="grid h-4/6 max-w-screen-xl grid-cols-1 overflow-hidden p-0 md:grid-cols-2">
        <CardContent className="flex flex-col items-center justify-center gap-8 p-16 text-center">
          <div className="flex flex-col items-center gap-2">
            <RiDashboard3Line className="size-12 text-primary" />
            <h1 className="text-4xl tracking-tight">Portfolio Analyzer</h1>
          </div>

          <h2 className="text-3xl font-light">Sign up</h2>
          <p className="text-muted-foreground">
            Sign up now to unlock the full potential of Portfolio Analyzer and maximize your investment returns with
            exclusive insights.
          </p>

          <Button onClick={() => (window.location.href = loginUrl)}>
            <RiGoogleFill data-icon="inline-start" />
            Sign in with Google
          </Button>
        </CardContent>
        <img src="/portfolio-analyzer/signup.webp" className="hidden h-full object-cover md:block" alt="" />
      </Card>
    </section>
  )
}
