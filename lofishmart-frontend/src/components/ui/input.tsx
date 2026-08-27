import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  helperText?: string;
  fullWidth?: boolean;
  inputClassName?: string;
}

function Input({
  className,
  type,
  label,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftAddon,
  rightAddon,
  helperText,
  fullWidth = true,
  inputClassName = "",
  id,
  name,
  ...props
}: InputProps) {
  const inputId = id || name;

  return (
    <div className={cn(fullWidth ? "w-full" : "w-auto", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-muted-foreground mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
        {leftAddon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            {leftAddon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            (LeftIcon || leftAddon) && "pl-10",
            (RightIcon || rightAddon) && "pr-10",
            error && "border-destructive focus-visible:ring-destructive/20",
            inputClassName
          )}
          {...props}
        />

        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <RightIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
        {rightAddon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightAddon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <div className="mt-1.5 text-xs">
          {error && <p className="text-destructive font-medium">{error}</p>}
          {!error && helperText && (
            <p className="text-muted-foreground">{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
}

export { Input }
