import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      default: "size-4",
      sm: "size-3",
      lg: "size-6",
      xl: "size-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface SpinnerProps extends React.ComponentProps<"svg">, VariantProps<typeof spinnerVariants> { }

function Spinner({ className, size, ...props }: SpinnerProps) {
  return (
    <Loader2Icon role="status" aria-label="Loading" className={cn(spinnerVariants({ size, className }))} {...props} />
  )
}

export { Spinner, spinnerVariants }
