import { type LucideIcon } from "lucide-react";

interface StatCardProps {
	label: string;
	value: string | number;
	icon: LucideIcon;
	trend?: {
		value: number;
		label?: string;
		isPositive: boolean;
	};
	footer?: string;
	variant?: "default" | "hero" | "warning";
	className?: string;
}

export function StatCard({
	label,
	value,
	icon: Icon,
	trend,
	footer,
	variant = "default",
	className = "",
}: StatCardProps) {
	if (variant === "hero") {
		return (
			<div className={`bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 sm:p-8 rounded-2xl shadow-lg text-white flex flex-col justify-between min-h-[200px] ${className}`}>
				<div>
					<p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">
						{label}
					</p>
					<p className="text-3xl sm:text-4xl font-bold mt-3 tracking-tight">
						{value}
					</p>
					{trend && (
						<div className="flex items-center gap-2 mt-3">
							<Icon className={`w-4 h-4 ${trend.isPositive ? "text-emerald-200" : "text-red-200"}`} />
							<span className="text-sm text-emerald-100">
								{trend.isPositive ? "+" : ""}{trend.value.toFixed(1)}% {trend.label || ""}
							</span>
						</div>
					)}
				</div>
				{footer && (
					<p className="text-emerald-200 text-xs mt-4">
						{footer}
					</p>
				)}
			</div>
		);
	}

	if (variant === "warning") {
		const hasValue = typeof value === "number" ? value > 0 : Boolean(value);
		return (
			<div className={`p-5 rounded-2xl shadow-sm border ${hasValue ? `bg-red-50 border-red-100` : `bg-white border-gray-100`} ${className}`}>
				<div className="flex items-center justify-between mb-3">
					<p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
						{label}
					</p>
					<div className={`p-2 rounded-lg ${hasValue ? `bg-red-100 text-red-600` : `bg-gray-50 text-gray-400`} `}>
						<Icon className="w-4 h-4" />
					</div>
				</div>
				<p className={`text-2xl font-bold ${hasValue ? `text-red-600` : `text-gray-900`} `}>
					{value}
				</p>
				{footer && (
					<p className="text-xs text-gray-400 mt-2">
						{footer}
					</p>
				)}
			</div>
		);
	}

	// Default variant
	return (
		<div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ${className}`}>
			<div className="flex items-center justify-between mb-3">
				<p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
					{label}
				</p>
				<div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
					<Icon className="w-4 h-4" />
				</div>
			</div>
			<p className="text-2xl font-bold text-gray-900">{value}</p>
			{trend && (
				<div className="flex items-center gap-1.5 mt-2">
					<Icon className={`w-3.5 h-3.5 ${trend.isPositive ? "text-emerald-500" : "text-red-500"}`} />
					<span className={`text-xs font-medium ${trend.isPositive ? `text-emerald-600` : `text-red-600`} `}>
						{trend.isPositive ? "+" : ""}{trend.value.toFixed(1)}%
					</span>
					{trend.label && <span className="text-xs text-gray-400">{trend.label}</span>}
				</div>
			)}
			{footer && (
				<p className="text-xs text-gray-400 mt-2">{footer}</p>
			)}
		</div>
	);
}
