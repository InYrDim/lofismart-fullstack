import React, { useState, useCallback } from "react";

import type { QRData } from "@/types/payment";
import { PaymentContext } from "@/hooks/usePayment";

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [qrData, setQrData] = useState<QRData | null>(null);
	const [expiresAt, setExpiresAt] = useState<number | null>(null);

	const clearPaymentState = useCallback(() => {
		setQrData(null);
		setExpiresAt(null);
	}, []);

	// Global Expiration Timer
	React.useEffect(() => {
		if (!expiresAt) return;

		const checkExpiration = () => {
			const now = Date.now();
			const diff = expiresAt - now;

			if (diff <= 0) {
				clearPaymentState();
			}
		};

		// Check immediately
		checkExpiration();

		// Check every second
		const interval = setInterval(checkExpiration, 1000);

		return () => clearInterval(interval);
	}, [expiresAt, clearPaymentState]);

	const value = {
		qrData,
		expiresAt,
		setQrData,
		setExpiresAt,
		clearPaymentState,
		isPaymentPending: !!qrData,
	};

	return (
		<PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
	);
};
