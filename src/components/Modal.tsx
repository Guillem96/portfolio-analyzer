import { Card } from "@tremor/react"
import { ReactNode } from "react"

interface ModalProps {
  show: boolean
  handleClose: () => void
  children: ReactNode
}

const Modal = ({ show, handleClose, children }: ModalProps) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75 p-8 ${show ? "" : "hidden"}`}
      onClick={handleClose}
    >
      <Card decoration="top" className="max-w-lg">
        <div className="mx-2 w-full rounded-lg p-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="absolute right-4 top-4 text-tremor-content dark:text-dark-tremor-content"
            onClick={handleClose}
          >
            &times;
          </button>
          {children}
        </div>
      </Card>
    </div>
  )
}

export default Modal
