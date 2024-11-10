import LightDarkThemeSwitch from "@/components/LightDarkThemeSwitch"
import { RiDashboard3Line, RiGoogleFill } from "@remixicon/react"
import { Button, Card, Icon } from "@tremor/react"

export default function SignUp() {
  const loginUrl = import.meta.env.VITE_SERVER_URL + "/auth/google/login"
  return (
    <section className="relative flex h-screen items-center justify-center px-4">
      <div className="absolute right-5 top-5 z-10">
        <LightDarkThemeSwitch />
      </div>
      <img src="/portfolio-analyzer/signup.webp" className="absolute top-0 h-full w-full opacity-20" />
      <Card className="grid h-4/6 max-w-screen-xl grid-cols-1 rounded-md p-0 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-y-8 p-16 text-center">
          <div>
            <Icon size="xl" icon={RiDashboard3Line} className="mb-2 scale-150" />
            <h1 className="text-4xl tracking-tight text-slate-900 dark:text-neutral-300">Portfolio Analyzer</h1>
          </div>

          <h2 className="text-3xl font-light text-slate-900 dark:text-neutral-300">Sign up</h2>
          <p className="text-tremor-content dark:text-dark-tremor-content">
            Sign up now to unlock the full potential of Portfolio Analyzer and maximize your investment returns with
            exclusive insights.
          </p>

          <div className="flex flex-col items-center">
            <Button icon={RiGoogleFill} variant="primary" onClick={() => (window.location.href = loginUrl)}>
              Sign in with Google
            </Button>
          </div>
        </div>
        <img src="/portfolio-analyzer/signup.webp" className="hidden h-full rounded-r-md object-cover md:block"></img>
      </Card>
    </section>
  )
}
