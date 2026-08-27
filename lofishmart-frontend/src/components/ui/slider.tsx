"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
    className,
    defaultValue,
    value,
    min = 0,
    max = 100,
    ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
    return (
        <SliderPrimitive.Root
            data-slot="slider"
            defaultValue={defaultValue}
            value={value}
            min={min}
            max={max}
            className={cn(
                "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
                className
            )}
            {...props}
        >
            <SliderPrimitive.Track className="bg-muted relative h-1.5 w-full grow overflow-hidden rounded-full">
                <SliderPrimitive.Range className="bg-primary absolute h-full" />
            </SliderPrimitive.Track>
            {(value ?? defaultValue ?? [0]).map((_, i) => (
                <SliderPrimitive.Thumb
                    key={i}
                    className="border-primary bg-background ring-ring/50 block size-4 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none"
                />
            ))}
        </SliderPrimitive.Root>
    )
}

export { Slider }
