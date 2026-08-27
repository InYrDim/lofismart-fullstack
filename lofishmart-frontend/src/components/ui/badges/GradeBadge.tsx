import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

interface GradeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    gradeName: string | null | undefined;
    showTooltip?: boolean;
}

export function GradeBadge({ gradeName, showTooltip = true, className, ...props }: GradeBadgeProps) {
    if (!gradeName) return null;

    const getGradeBadgeClass = (name: string) => {
        switch (name.toUpperCase()) {
            case "GRADE A":
                return "bg-teal-100 text-teal-700 border-teal-200 hover:border-teal-300";
            case "GRADE B":
                return "bg-indigo-100 text-indigo-700 border-indigo-200 hover:border-indigo-300";
            case "GRADE C":
                return "bg-orange-100 text-orange-700 border-orange-200 hover:border-orange-300";
            case "GRADE D":
                return "bg-red-100 text-red-700 border-red-200 hover:border-red-300";
            default:
                return "bg-blue-50 text-blue-600 border-blue-100";
        }
    };

    const BadgeContent = (
        <span
            className={cn(
                "px-1.5 py-0.5 rounded border leading-none transition-colors duration-200",
                getGradeBadgeClass(gradeName),
                className
            )}
            {...props}
        >
            {gradeName}
        </span>
    );

    if (showTooltip) {
        return <Tooltip content="kualitas produk">{BadgeContent}</Tooltip>;
    }

    return BadgeContent;
}
