import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center py-4",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-secondary/50 dark:bg-secondary/30">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-200" />
    </SliderPrimitive.Track>
    {Array.from({ length: (props.value as number[])?.length || 1 }).map((_, index) => (
      <SliderPrimitive.Thumb 
        key={index}
        className="block h-6 w-6 rounded-full border-2 border-primary bg-background shadow-lg ring-offset-background transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing active:scale-105" 
      />
    ))}
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
