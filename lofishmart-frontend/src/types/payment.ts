export interface QRData {
	qr_string: string;
	id: string;
	reference_id: string;
}

export interface PaymentContextType {
	qrData: QRData | null;
	expiresAt: number | null;
	setQrData: (data: QRData | null) => void;
	setExpiresAt: (time: number | null) => void;
	clearPaymentState: () => void;
	isPaymentPending: boolean;
}
