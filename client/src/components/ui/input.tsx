import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-md border border-gray-200 border-input bg-background px-3 py-1 text-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none", 
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
