import {
	useState,
	forwardRef,
	useImperativeHandle,
	useEffect,
	useRef,
	useCallback,
} from "react";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, RefreshCw, Clock } from "lucide-react";
import { XenditService } from "@/services/xendit.service";
import { formatRupiah } from "@/utils";
import { CONFIG } from "@/config";
import { usePayment } from "@/hooks/usePayment";
import { toast } from "sonner";
import { storage } from "@/utils/storage";

interface QRISPaymentProps {
	amount: number;
	onSuccess?: () => void;
}

export interface QRISPaymentRef {
	generateQR: (referenceId?: string) => Promise<void>;
}

// Separate hook for WebSocket logic
const useWebSocketPayment = (
	qrData: { id: string; reference_id: string } | null,
	amount: number,
	onSuccess: () => void,
	onError: (error: Event) => void,
	enabled: boolean,
) => {
	const onSuccessRef = useRef(onSuccess);
	useEffect(() => {
		onSuccessRef.current = onSuccess;
	}, [onSuccess]);

	useEffect(() => {
		if (!enabled || !qrData) return;

		let isCleanedUp = false;

		// Get token and strip 'Bearer ' if present to pass as query param
		const rawToken = storage.getToken();
		const token = rawToken ? rawToken.replace("Bearer ", "") : "";
		const wsUrl = `${CONFIG.WEBSOCKET_URL}?token=${token}`;

		const ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			if (!isCleanedUp) {
				console.log("Connected to Payment WebSocket");
			}
		};

		ws.onmessage = (event) => {
			if (isCleanedUp) return;
			try {
				const message = JSON.parse(event.data);
				console.log("WebSocket Message:", message);

				if (
					message.event === "payment.success" &&
					message.data.status === "SUCCEEDED" &&
					Math.abs(message.data.amount - amount) < 1 // Tolerance
				) {
					if (message.data.reference_id === qrData.reference_id) {
						console.log("Payment Confirmed (WebSocket)!");
						ws.close();
						onSuccessRef.current?.();
					}
				}
			} catch (err) {
				console.error("Error parsing WebSocket message:", err);
			}
		};

		ws.onerror = (error) => {
			if (!isCleanedUp) {
				console.error("WebSocket Error:", error);
				onError(error);
			}
		};

		return () => {
			isCleanedUp = true;
			if (
				ws.readyState === WebSocket.OPEN ||
				ws.readyState === WebSocket.CONNECTING
			) {
				ws.close();
			}
		};
	}, [qrData, enabled, onError, amount]);
};

// Separate hook for Polling logic
const usePollingPayment = (
	qrData: { id: string; reference_id: string } | null,
	onSuccess: () => void,
	enabled: boolean,
	intervalMs: number = 5000,
) => {
	const onSuccessRef = useRef(onSuccess);
	useEffect(() => {
		onSuccessRef.current = onSuccess;
	}, [onSuccess]);

	useEffect(() => {
		if (!enabled || !qrData) return;

		console.log("Starting Polling for Payment Status...");
		const interval = setInterval(async () => {
			try {
				const data = await XenditService.getQRCode(qrData.id);
				if (data.status === "ACTIVE") {
					// Still active, waiting for payment
				} else if (data.status === "SUCCEEDED" || data.status === "COMPLETED") {
					// Check Xendit specific success status
					console.log("Payment Confirmed (Polling)!");
					clearInterval(interval);
					onSuccessRef.current?.();
				} else {
					// Handle other statuses if necessary (FAILED, etc)
					console.log("Payment Status (Polling):", data.status);
				}
			} catch (error) {
				console.error("Polling Error:", error);
			}
		}, intervalMs);

		return () => clearInterval(interval);
	}, [qrData, enabled, intervalMs]);
};

export const QRISPayment = forwardRef<QRISPaymentRef, QRISPaymentProps>(
	({ amount, onSuccess }, ref) => {
		const { qrData, setQrData, expiresAt, setExpiresAt } = usePayment();
		const [isLoading, setIsLoading] = useState(false);
		const [error, setError] = useState<string | null>(null);
		const [remainingTime, setRemainingTime] = useState<number>(0);

		// Payment Method State: 'websocket' (default) -> fallback to 'polling'
		const [checkMethod, setCheckMethod] = useState<"websocket" | "polling">(
			"websocket",
		);

		// Removed Toast state

		// Reset check method when new QR is generated
		useEffect(() => {
			if (qrData) {
				setCheckMethod("websocket");
			}
		}, [qrData]);

		const handleWSError = useCallback(() => {
			if (checkMethod === "websocket") {
				console.warn("WebSocket failed, switching to polling...");
				toast("Switching to polling mode");
				setCheckMethod("polling");
			}
		}, [checkMethod]);

		// Use Hooks
		useWebSocketPayment(
			qrData,
			amount,
			onSuccess || (() => { }),
			handleWSError,
			checkMethod === "websocket",
		);
		usePollingPayment(
			qrData,
			onSuccess || (() => { }),
			checkMethod === "polling",
		);

		// Timer Effect
		useEffect(() => {
			if (!expiresAt) return;

			const initialDiff = Math.ceil((expiresAt - Date.now()) / 1000);
			setRemainingTime(initialDiff > 0 ? initialDiff : 0);

			const interval = setInterval(() => {
				const now = Date.now();
				const diff = Math.ceil((expiresAt - now) / 1000);

				if (diff <= 0) {
					setRemainingTime(0);
				} else {
					setRemainingTime(diff);
				}
			}, 1000);

			return () => clearInterval(interval);
		}, [expiresAt, setQrData, setExpiresAt]);

		const formatTime = (seconds: number) => {
			const m = Math.floor(seconds / 60);
			const s = seconds % 60;
			return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
		};

		const handleGenerateQR = async (externalReferenceId?: string) => {
			if (isLoading || qrData) return;
			setIsLoading(true);
			setError(null);
			// Reset to websocket preference on new generation
			setCheckMethod("websocket");

			try {
				const referenceId =
					externalReferenceId || XenditService.generateReferenceId();
				const expiresAt = new Date(
					Date.now() + CONFIG.QRIS_TIMEOUT_MINUTES * 60 * 1000,
				).toISOString();

				const roundedAmount = Math.round(amount);
				console.log("Amount:", amount);
				console.log("Rounded Amount:", roundedAmount);

				const response = await XenditService.createQRCode(
					roundedAmount,
					referenceId,
					expiresAt,
				);
				setQrData({
					qr_string: response.qr_string,
					id: response.id,
					reference_id: response.reference_id,
				});
				setExpiresAt(new Date(expiresAt).getTime());
				setRemainingTime(CONFIG.QRIS_TIMEOUT_MINUTES * 60);
			} catch (err) {
				if (err instanceof Error) {
					setError(err.message);
				} else {
					setError("Gagal membuat QRIS");
				}
			} finally {
				setIsLoading(false);
			}
		};

		useImperativeHandle(ref, () => ({
			generateQR: handleGenerateQR,
		}));

		return (
			<div className="h-full flex flex-col justify-center items-center space-y-1 text-center animate-in fade-in zoom-in duration-300">
				<div className="border-2 border-dashed border-border-subtle rounded-xl p-3 flex flex-col items-center justify-center bg-bg-canvas relative overflow-hidden group w-full max-w-[200px] mx-auto">
					{/* Background Pattern */}
					<div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-50"></div>

					<div className="bg-white p-2 rounded-lg shadow-sm mb-1 relative z-10 group-hover:scale-105 transition-transform duration-300 min-h-[140px] min-w-[140px] flex items-center justify-center">
						{isLoading ? (
							<Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
						) : qrData ? (
							<QRCodeSVG value={qrData.qr_string} size={128} />
						) : (
							<div className="flex flex-col items-center justify-center space-y-2 opacity-50">
								<RefreshCw className="w-8 h-8" />
								<span className="text-[10px]">Klik Tombol Generate</span>
							</div>
						)}
					</div>
					<p className="text-xs text-text-secondary font-medium relative z-10">
						{qrData
							? `Scan QRIS: ${formatRupiah(amount)}`
							: `Total: ${formatRupiah(amount)}`}
					</p>

					{qrData && (
						<div className="mt-1 flex flex-col items-center gap-1 relative z-10 w-full animate-in slide-in-from-bottom-2">
							<div
								className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-mono font-bold ${checkMethod === "websocket"
									? "text-green-600 bg-green-50 border-green-100"
									: "text-orange-600 bg-orange-50 border-orange-100"
									}`}
							>
								{checkMethod === "websocket" ? (
									<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
								) : (
									<Clock className="w-3 h-3 animate-spin duration-[3000ms]" />
								)}
								<span>{formatTime(remainingTime)}</span>
							</div>
							<div className="text-[10px] text-text-muted text-center mt-2 border-t border-dashed border-border-subtle pt-2 w-full">
								<span className="opacity-70">Reference ID:</span>
								<br />
								<code className="font-mono text-xs text-text-primary select-all">
									{qrData.reference_id}
								</code>
							</div>
						</div>
					)}
				</div>
				{error && <p className="text-red-500 text-sm">{error}</p>}


			</div>
		);
	},
);
