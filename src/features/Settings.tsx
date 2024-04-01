import { useBoundStore } from "@/store"
import { RiDashboard3Line } from "@remixicon/react"
import { Button, Card, Icon, TextInput } from "@tremor/react"

export default function Settings() {
  const [jsonBinAccessKey, jsonBinId, setJsonBin, setInSettingsScreen] = useBoundStore((state) => [
    state.jsonBinAccessKey,
    state.jsonBinId,
    state.setJsonBin,
    state.setInSettingsScreen,
  ])

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    const accessKey = data.get("json-bin-access-key")?.toString() ?? ""
    const binId = data.get("json-bin-id")?.toString() ?? ""

    setJsonBin(accessKey, binId)
    setInSettingsScreen(false)
  }

  return (
    <Card className="flex flex-col justify-center items-center text-center gap-y-8 max-w-md mx-auto">
      <div>
        <Icon size="xl" icon={RiDashboard3Line} className="scale-150 mb-2" />
        <h1 className="text-4xl tracking-tight text-slate-900 dark:text-neutral-300">Portfolio Analyzer</h1>
      </div>

      <div className="text-tremor-content dark:text-dark-tremor-content">
        <p>
          Portfolio Analyzer uses{" "}
          <a href="https://jsonbin.io/" target="_blank" rel="noreferrer">
            JSON Bin
          </a>{" "}
          as the database.
        </p>
        <p>
          Create a <strong>JSON Bin</strong> account and set up an{" "}
          <strong>Access Key with read/update permissions on bins</strong>.
        </p>
        <p>
          You will also have to create a <strong>BIN</strong>.
        </p>
      </div>
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 mx-auto">
        <div className="w-full">
          <label
            htmlFor="json-bin-access-key"
            className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
          >
            JSON Bin Access Key
          </label>
          <TextInput
            required={true}
            defaultValue={jsonBinAccessKey ?? ""}
            id="json-bin-access-key"
            name="json-bin-access-key"
            placeholder="$2a$..."
          />
        </div>
        <div className="w-full">
          <label
            htmlFor="json-bin-id"
            className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
          >
            JSON Bin ID
          </label>
          <TextInput
            required={true}
            defaultValue={jsonBinId ?? ""}
            id="json-bin-id"
            name="json-bin-id"
            placeholder="6603c84..."
          />
        </div>
        <Button type="submit">Update settings</Button>
      </form>
    </Card>
  )
}
