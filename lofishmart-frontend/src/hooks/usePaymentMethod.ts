import { useState, useMemo } from "react";
import { Banknote, QrCode } from "lucide-react";

export interface PaymentMethodOption {
	id: string;
	name: string;
	type: "CASH" | "QRIS" | "OTHER";
	icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

// Hardcoded data matching database
const AVAILABLE_PAYMENT_METHODS: PaymentMethodOption[] = [
	{
		id: "cash",
		name: "Tunai",
		type: "CASH",
		icon: Banknote,
	},
	{
		id: "qris",
		name: "QRIS",
		type: "QRIS",
		icon: QrCode,
	},
];

export const usePaymentMethod = () => {
	const [activePaymentMethodId, setActivePaymentMethodId] =
		useState<string>("cash");

	const paymentMethods = AVAILABLE_PAYMENT_METHODS;

	const activePaymentMethod = useMemo(
		() =>
			paymentMethods.find((pm) => pm.id === activePaymentMethodId) ||
			paymentMethods[0],
		[activePaymentMethodId, paymentMethods],
	);

	const isCash = activePaymentMethod.type === "CASH";
	const isQRIS = activePaymentMethod.type === "QRIS";

	return {
		paymentMethods,
		activePaymentMethodId,
		setPaymentMethod: setActivePaymentMethodId,
		activePaymentMethod,
		isCash,
		isQRIS,
	};
};
