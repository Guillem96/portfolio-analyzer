import { Risk } from "@/types.d"
import { Badge } from "@tremor/react"
import { RISK_COLOR } from "@/constants"

interface Props {
  risk: Risk
  className?: string
  onClick?: (risk: Risk) => void
}

export default function RiskBadge({ risk, className = "", onClick }: Props) {
  return (
    <Badge className={className} color={RISK_COLOR[risk].replace("bg-", "")} onClick={() => onClick && onClick(risk)}>
      {risk}
    </Badge>
  )
}
