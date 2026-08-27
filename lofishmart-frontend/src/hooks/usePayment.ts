import { createContext, useContext } from "react";
import type { PaymentContextType } from "@/types/payment";

export const PaymentContext = createContext<PaymentContextType | undefined>(
	undefined,
);

export const usePayment = () => {
	const context = useContext(PaymentContext);
	if (context === undefined) {
		throw new Error("usePayment must be used within a PaymentProvider");
	}
	return context;
};
