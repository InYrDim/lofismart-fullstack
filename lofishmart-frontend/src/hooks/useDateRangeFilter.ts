import { useState } from "react";
import {
	startOfDay,
	endOfDay,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	startOfYear,
	endOfYear,
	format,
} from "date-fns";

export type DateFilterType = "today" | "week" | "month" | "year" | "all";

export const useDateRangeFilter = (initialFilter: DateFilterType = "month") => {
	const [filterType, setFilterType] = useState<DateFilterType>(initialFilter);

	// Initialize dates based on the initial filter
	const getInitialDates = (type: DateFilterType) => {
		const today = new Date();
		let start = format(startOfMonth(today), "yyyy-MM-dd");
		let end = format(endOfMonth(today), "yyyy-MM-dd");

		switch (type) {
			case "today":
				start = format(startOfDay(today), "yyyy-MM-dd");
				end = format(endOfDay(today), "yyyy-MM-dd");
				break;
			case "week":
				start = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
				end = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
				break;
			case "month":
				start = format(startOfMonth(today), "yyyy-MM-dd");
				end = format(endOfMonth(today), "yyyy-MM-dd");
				break;
			case "year":
				start = format(startOfYear(today), "yyyy-MM-dd");
				end = format(endOfYear(today), "yyyy-MM-dd");
				break;
			case "all":
				start = "2020-01-01";
				end = format(endOfDay(today), "yyyy-MM-dd");
				break;
		}
		return { start, end };
	};

	const initialDates = getInitialDates(initialFilter);
	const [startDate, setStartDate] = useState(initialDates.start);
	const [endDate, setEndDate] = useState(initialDates.end);

	const handleFilterChange = (value: string | number) => {
		const type = String(value) as DateFilterType;
		setFilterType(type);

		const today = new Date();
		let newStart = startDate;
		let newEnd = endDate;

		switch (type) {
			case "today":
				newStart = format(startOfDay(today), "yyyy-MM-dd");
				newEnd = format(endOfDay(today), "yyyy-MM-dd");
				break;
			case "week":
				newStart = format(
					startOfWeek(today, { weekStartsOn: 1 }),
					"yyyy-MM-dd",
				); // Monday start
				newEnd = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
				break;
			case "month":
				newStart = format(startOfMonth(today), "yyyy-MM-dd");
				newEnd = format(endOfMonth(today), "yyyy-MM-dd");
				break;
			case "year":
				newStart = format(startOfYear(today), "yyyy-MM-dd");
				newEnd = format(endOfYear(today), "yyyy-MM-dd");
				break;
			case "all":
				newStart = "2020-01-01"; // Arbitrary past date
				newEnd = format(endOfDay(today), "yyyy-MM-dd");
				break;
			default:
				break;
		}
		setStartDate(newStart);
		setEndDate(newEnd);
	};

	// Helper to manually set dates (e.g., from date picker)
	const setManualDateRange = (start: string, end: string) => {
		setStartDate(start);
		setEndDate(end);
		// If manual range doesn't match a preset, strictly we might want to set filterType to 'custom' or keep as is.
		// For now, let's keep it simple.
	};

	return {
		startDate,
		endDate,
		filterType,
		setFilterType,
		handleFilterChange,
		setManualDateRange,
	};
};
