import React from "react";
import { DateInput } from "./DateInput.old";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
	startDate: string;
	endDate: string;
	onStartDateChange: (date: string) => void;
	onEndDateChange: (date: string) => void;
	minDate?: string;
	maxDate?: string;
	disabled?: boolean;
	className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
	minDate,
	maxDate,
	disabled,
	className = "",
}) => {
	return (
		<div
			className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-4 ${className}`}
		>
			<DateInput
				value={startDate}
				onChange={onStartDateChange}
				max={endDate || maxDate} // Start date shouldn't be after end date
				min={minDate}
				disabled={disabled}
				leftIcon={Calendar}
				inputClassName="w-full sm:w-auto"
			/>
			<span className="text-gray-400 font-medium hidden sm:block">-</span>
			<DateInput
				value={endDate}
				onChange={onEndDateChange}
				min={startDate || minDate} // End date shouldn't be before start date
				max={maxDate}
				disabled={disabled}
				leftIcon={Calendar}
				inputClassName="w-full sm:w-auto"
			/>
		</div>
	);
};
