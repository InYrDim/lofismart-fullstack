import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "./badge";

interface PaymentStatusBadgeProps {
	isPaid: string;
	className?: string; // Allow passing extra classes if needed
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
	isPaid,
	className,
}) => {
	switch (isPaid) {
		case "3":
			return (
				<Badge variant="success" className={`gap-1.5 ${className || ""}`}>
					<CheckCircle className="w-3.5 h-3.5" />
					Lunas
				</Badge>
			);
		case "2":
			return (
				<Badge variant="destructive" className={`gap-1.5 ${className || ""}`}>
					<XCircle className="w-3.5 h-3.5" />
					Belum Dibayar
				</Badge>
			);
		case "1":
			return (
				<Badge variant="warning" className={`gap-1.5 ${className || ""}`}>
					<Clock className="w-3.5 h-3.5" />
					Overview
				</Badge>
			);
		default:
			return (
				<Badge variant="secondary" className={className}>
					-
				</Badge>
			);
	}
};
