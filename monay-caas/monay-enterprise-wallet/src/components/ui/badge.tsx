import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
        destructive:
          "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80",
        outline: "text-foreground border border-slate-200 dark:border-slate-800",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-500/80 dark:bg-green-900 dark:text-slate-50 dark:hover:bg-green-900/80",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80 dark:bg-yellow-900 dark:text-slate-50 dark:hover:bg-yellow-900/80",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-500/80 dark:bg-blue-900 dark:text-slate-50 dark:hover:bg-blue-900/80",
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
        gradient:
          "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }