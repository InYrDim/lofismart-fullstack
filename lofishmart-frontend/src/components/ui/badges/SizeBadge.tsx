import React from "react";
import { cn } from "@/lib/utils";

interface SizeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    sizeName: string | null | undefined;
}

export function SizeBadge({ sizeName, className, ...props }: SizeBadgeProps) {
    if (!sizeName) return null;

    const getSizeBadgeClass = (name: string) => {
        switch (name.toUpperCase()) {
            case "BESAR":
                return "bg-purple-100 text-purple-700 border-purple-200 hover:border-purple-300";
            case "SEDANG":
                return "bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300";
            case "KECIL":
                return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:border-yellow-300";
            case "BABY":
                return "bg-rose-100 text-rose-700 border-rose-200 hover:border-rose-300";
            default:
                return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    return (
        <span
            className={cn(
                "px-1.5 py-0.5 rounded border leading-none transition-colors duration-200",
                getSizeBadgeClass(sizeName),
                className
            )}
            {...props}
        >
            {sizeName}
        </span>
    );
}
