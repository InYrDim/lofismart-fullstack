import { forwardRef } from "react";
import { Input } from "./input";
import type { LucideIcon } from "lucide-react";

interface DateInputProps {
	label?: string;
	value: string;
	onChange: (value: string) => void;
	min?: string;
	max?: string;
	disabled?: boolean;
	error?: string;
	className?: string;
	helperText?: string;
	leftIcon?: LucideIcon;
	inputClassName?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
	(
		{
			label,
			value,
			onChange,
			min,
			max,
			disabled,
			error,
			className,
			helperText,
			leftIcon,
			inputClassName,
		},
		ref,
	) => {
		return (
			<Input
				ref={ref}
				type="date"
				label={label}
				value={value}
				onChange={(e: any) => onChange(e.target.value)}
				min={min}
				max={max}
				disabled={disabled}
				error={error}
				className={className}
				inputClassName={inputClassName}
				helperText={helperText}
				leftIcon={leftIcon}
			/>
		);
	},
);

DateInput.displayName = "DateInput";
