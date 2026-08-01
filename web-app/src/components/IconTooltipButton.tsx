import type { RemixiconComponentType } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface IconTooltipButtonProps extends React.ComponentProps<typeof Button> {
  tooltip: string
  icon: RemixiconComponentType
}

export function IconTooltipButton({ tooltip, icon: Icon, className, ...props }: IconTooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-lg" className={className} {...props}>
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
