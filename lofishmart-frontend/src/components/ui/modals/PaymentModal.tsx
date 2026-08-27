import { useState, useRef, useEffect } from "react";
import { X, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "./Modal";
import type { CartItem, CartSummary, Transaction } from "@/types";
import { formatRupiah } from "@/utils";
import { PaymentSummary } from "@/components/payment/PaymentSummary";
import { CashPayment } from "@/components/payment/CashPayment";
import { QRISPayment, type QRISPaymentRef } from "@/components/payment/QRISPayment";
import { usePayment } from "@/hooks/usePayment";
import { AuthService } from "@/services/auth.service";
import { usePaymentMethod } from "@/hooks/usePaymentMethod";
import { XenditService } from "@/services/xendit.service";
import { toast } from "sonner";
import { parseCashAmount, canProcessPayment, buildPaymentPayload, enrichTransactionForInvoice } from "@/utils/payment";

interface PaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (paymentAmount: number, transaction: Transaction) => void;
	cart: CartItem[];
	activeVoucher?: string;
	voucherDiscount: number;
	summary: CartSummary;
}

const PaymentModalContent: React.FC<PaymentModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
	cart,
	activeVoucher,
	summary,
}) => {
	const {
		paymentMethods,
		activePaymentMethod,
		setPaymentMethod,
		isCash,
		isQRIS,
	} = usePaymentMethod();
	const [cashAmount, setCashAmount] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState(false);

	// Store transaction for invoice generation
	const currentTransactionRef = useRef<Transaction | null>(null);
	// Store transaction ID for async updates (QRIS)
	const currentTransactionIdRef = useRef<string | null>(null);

	// Ref for QRIS Payment to trigger generation
	const qrisRef = useRef<QRISPaymentRef>(null);
	const { clearPaymentState, isPaymentPending } = usePayment();
	const [showCancelAlert, setShowCancelAlert] = useState(false);

	// Reset state when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			setCashAmount("");
			setIsProcessing(false);
			currentTransactionRef.current = null;
			currentTransactionIdRef.current = null;
			clearPaymentState();
		} else {
			clearPaymentState();
		}
	}, [isOpen, clearPaymentState, setPaymentMethod]);

	// Derived state — round ke integer agar tidak ada floating-point artifact
	const totalAmount = Math.round(summary.total);
	const cash = parseCashAmount(cashAmount);
	const change = Math.max(0, cash - totalAmount);

	const handlePayment = async () => {
		setIsProcessing(true);

		try {
			const user = AuthService.getCurrentUser();
			const userId = user?.id;
			const marketId = localStorage.getItem("lofish_market_id");

			if (!canProcessPayment(user)) {
				toast.error("Hanya kasir atau admin yang mampu melakukan pembayaran.");
				setIsProcessing(false);
				return;
			}

			if (!userId || !marketId) {
				if (!marketId && user) {
					toast.error("Market belum dipilih. Silakan pilih market dari menu Pengaturan.");
				} else {
					toast.error("User tidak teridentifikasi. Silakan login ulang.");
				}
				setIsProcessing(false);
				return;
			}

			const paymentId = XenditService.generateReferenceId();

			const payload = buildPaymentPayload({
				cart,
				summary,
				cashAmount,
				change,
				isCash,
				marketId,
				userId,
				paymentMethodId: activePaymentMethod.id,
				paymentId,
			});

			console.log("Creating Transaction:", payload);

			// Dynamic import (TransactionService)
			const { TransactionService } =
				await import("../../../services/transaction.service");
			const transaction = await TransactionService.createTransaction(payload);

			const enrichedTx = enrichTransactionForInvoice(
				transaction as unknown as Record<string, unknown>,
				AuthService.getCurrentUser(),
				activePaymentMethod.name,
			);

			// Store transaction for invoice generation
			currentTransactionRef.current = enrichedTx as never;
			currentTransactionIdRef.current = transaction.id;

			if (isCash) {
				// Cash payment is done immediately
				const finalPaymentAmount = parseCashAmount(cashAmount);
				setIsProcessing(false);
				onSuccess(finalPaymentAmount, transaction);
				return;
			}

			if (isQRIS) {
				if (qrisRef.current) {
					// 1. Generate QR with pre-generated reference ID
					await qrisRef.current.generateQR(paymentId);

					// 2. Update status to "1" (Overview/Processing)
					if (currentTransactionIdRef.current) {
						await TransactionService.updateTransaction(
							currentTransactionIdRef.current,
							{ is_paid: "1" },
						);
					}
				}
				// We don't call onSuccess yet, we wait for QRIS component callback
				setIsProcessing(false);
			}
		} catch (error) {
			console.log("Payment failed", error);
			toast.error("Failed to process payment. Please try again.");
			setIsProcessing(false);
		}
	};

	const handleQRISSuccess = async () => {
		try {
			if (currentTransactionIdRef.current) {
				const { TransactionService } =
					await import("../../../services/transaction.service");
				await TransactionService.updateTransaction(
					currentTransactionIdRef.current,
					{ is_paid: "3" },
				);
			}
			if (currentTransactionRef.current) {
				onSuccess(totalAmount, currentTransactionRef.current);
			}
		} catch (error) {
			console.error("Failed to update final status:", error);
			toast.error(
				"Payment confirmed but status update failed. Please check transaction history.",
			);
			if (currentTransactionRef.current) {
				onSuccess(totalAmount, currentTransactionRef.current);
			}
		}
	};

	// Determine button text and disabled state
	const getButtonConfig = () => {
		if (isCash) {
			return {
				text: "Bayar",
				disabled: parseCashAmount(cashAmount) < totalAmount,
			};
		}
		// QRIS Logic
		if (isQRIS) {
			if (isPaymentPending) {
				return {
					text: "Scan QR Code",
					disabled: true,
				};
			}
			return {
				text: "Generate QRIS",
				disabled: false,
			};
		}

		return {
			text: "Bayar",
			disabled: false,
		};
	};

	const buttonConfig = getButtonConfig();

	const handleCloseAttempt = () => {
		if (isPaymentPending) {
			setShowCancelAlert(true);
		} else {
			onClose();
		}
	};

	const confirmCancel = () => {
		setPaymentMethod("cash");
		clearPaymentState();
		setShowCancelAlert(false);
		onClose();
	};

	const renderPaymentContent = () => {
		if (isCash) {
			return (
				<CashPayment
					totalAmount={totalAmount}
					cashAmount={cashAmount}
					onCashChange={setCashAmount}
				/>
			);
		}
		if (isQRIS) {
			return (
				<QRISPayment
					ref={qrisRef}
					amount={totalAmount}
					onSuccess={handleQRISSuccess}
				/>
			);
		}
		return (
			<div className="flex items-center justify-center h-full text-text-secondary">
				<p>Metode pembayaran ini belum tersedia.</p>
			</div>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleCloseAttempt}
			className="max-w-5xl md:max-w-5xl"
			contentClassName="p-0 flex flex-col md:flex-row max-h-[90vh] overflow-hidden"
			size="xl"
		>
			<div className="flex-1 flex flex-col min-w-0 bg-white">
				{/* Header */}
				<div className="flex items-center justify-between p-3 border-b border-border-subtle shrink-0">
					<div className="flex items-center gap-2">
						<Banknote className="w-7 h-7" />
						<h2 className="text-xl font-bold text-text-primary">Pembayaran</h2>
					</div>
					<Button
						onClick={handleCloseAttempt}
						variant="ghost"
						size="sm"
						className="md:hidden p-1.5 rounded-full text-text-secondary"
					>
						<X className="w-4 h-4" />
					</Button>
				</div>

				<div className="bg-brand-primary/5 p-3 text-center shrink-0">
					<label className="text-[10px] text-brand-primary font-medium mb-0.5">
						Total Tagihan
					</label>
					<h3 className="text-2xl font-bold text-brand-primary">
						{formatRupiah(totalAmount)}
					</h3>
				</div>

				<div className="px-3 pt-3 pb-0 shrink-0">
					<label className="text-sm  font-medium text-text-secondary mb-1.5 block">
						Metode Pembayaran
					</label>
					<div className="flex p-0.5 gap-1 bg-gray-100 rounded-lg border border-border-subtle overflow-x-auto">
						{paymentMethods.map((method) => {
							const isActive = activePaymentMethod.id === method.id;
							const Icon = method.icon;
							return (
								<Button
									key={method.id}
									onClick={() => setPaymentMethod(method.id)}
									variant={isActive ? "primary" : "ghost"}
									size="sm"
									className={`flex-1 gap-1.5 h-8 text-xs min-w-[100px] ${
										isActive
											? "bg-white text-brand-primary! shadow-sm ring-1 ring-gray-200 hover:bg-white!"
											: "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
									}`}
								>
									<Icon className="w-3.5 h-3.5" />
									{method.name}
								</Button>
							);
						})}
					</div>
				</div>

				<div className="p-3 overflow-y-auto grow">{renderPaymentContent()}</div>

				<div className="flex justify-end gap-2 p-3 bg-white border-t border-border-subtle shrink-0">
					<Button
						onClick={handleCloseAttempt}
						variant="outline"
						className="flex-1 md:flex-none min-w-[80px] h-10 text-sm font-bold"
					>
						Batal
					</Button>
					<Button
						onClick={handlePayment}
						isLoading={isProcessing}
						disabled={buttonConfig.disabled}
						className="flex-1 md:flex-none min-w-[120px] h-10 text-sm font-bold shadow-lg shadow-brand-primary/20"
					>
						{buttonConfig.text}
					</Button>
				</div>
			</div>

			<PaymentSummary
				cart={cart}
				totalAmount={totalAmount}
				cashAmount={cashAmount}
				change={change}
				summary={summary}
				activeVoucher={activeVoucher}
				onClose={handleCloseAttempt}
				activeTab={activePaymentMethod.type}
			/>

			<Modal
				isOpen={showCancelAlert}
				onClose={() => setShowCancelAlert(false)}
				size="sm"
				variant="warning"
				layout="center"
				title="Batalkan Pembayaran?"
				description="QR Code Xendit masih aktif. Status pembayaran akan hilang jika Anda membatalkan sekarang."
				overlayClassName="z-[60]"
				className="z-60"
			>
				<div className="flex justify-end gap-2 mt-4">
					<Button
						variant="ghost"
						onClick={() => setShowCancelAlert(false)}
						className="text-sm"
					>
						Kembali
					</Button>
					<Button
						variant="danger"
						className="bg-red-600 hover:bg-red-100 text-white text-sm"
						onClick={confirmCancel}
					>
						Ya, Batalkan
					</Button>
				</div>
			</Modal>
		</Modal>
	);
};

export const PaymentModal: React.FC<PaymentModalProps> = (props) => {
	return <PaymentModalContent {...props} />;
};
