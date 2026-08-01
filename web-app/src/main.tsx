import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import "react-toastify/dist/ReactToastify.css"
import React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TooltipProvider>
      <App />
      <Toaster richColors closeButton />
    </TooltipProvider>
  </React.StrictMode>,
)
