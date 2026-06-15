import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn(
      "relative flex touch-none select-none items-center",
      orientation === "horizontal" ? "w-full" : "h-full flex-col",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative grow overflow-hidden rounded-full bg-white/20",
        orientation === "horizontal" ? "h-2 w-full" : "w-2 h-full"
      )}
    >
      <SliderPrimitive.Range
        className={cn(
          "absolute bg-primary",
          orientation === "horizontal" ? "h-full" : "w-full"
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-3 w-3 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
