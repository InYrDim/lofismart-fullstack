import type { User, CartItem, CreateTransactionItem, CreateTransactionRequest, CartSummary } from "@/types";
import { ROLES } from "@/config/roles";
import { getRoleId, checkRoleAny } from "@/hooks/useRoleAndPermission";

/**
 * Parse string cash amount ke number.
 * Hapus semua non-digit, lalu parseInt.
 */
export function parseCashAmount(cashAmount: string): number {
	return parseInt(cashAmount.replace(/\D/g, "")) || 0;
}

/**
 * Cek apakah user memiliki role yang diizinkan untuk proses payment.
 */
export function canProcessPayment(user: User | null): boolean {
	if (!user) return false;
	const roleId = getRoleId(user);
	return checkRoleAny(roleId, ROLES.CASHIER, ROLES.ADMIN, "Kasir", "Admin");
}

/**
 * Map cart items ke format payload CreateTransactionItem.
 */
export function mapCartItemsToPayload(cart: CartItem[]): CreateTransactionItem[] {
	return cart.map((item) => {
		const baseItem = {
			qty: item.qty,
			price: item.id as unknown as number,
			type: item.type,
			total_price: item.subtotal,
			mod_price: item.basePrice,
			note: "",
			total_weight: item.measuredWeight ? item.measuredWeight * item.qty : 0,
		};

		if (item.type === "SERVICE") {
			return {
				...baseItem,
				service_id: item.id,
			};
		}

		return {
			...baseItem,
			price_id: item.id,
		};
	});
}

/**
 * Hitung total weight dari items payload.
 */
export function calculateTotalWeight(items: CreateTransactionItem[]): number {
	return items.reduce((acc, curr) => acc + (curr.total_weight || 0), 0);
}

export interface BuildPaymentPayloadParams {
	cart: CartItem[];
	summary: CartSummary;
	cashAmount: string;
	change: number;
	isCash: boolean;
	marketId: string;
	userId: string;
	paymentMethodId: string;
	paymentId: string;
}

/**
 * Build full transaction payload untuk dikirim ke API.
 */
export function buildPaymentPayload(params: BuildPaymentPayloadParams): CreateTransactionRequest {
	const { cart, summary, cashAmount, change, isCash, marketId, userId, paymentMethodId, paymentId } = params;

	const itemsPayload = mapCartItemsToPayload(cart);
	const totalWeightQty = calculateTotalWeight(itemsPayload);
	const initialIsPaid = isCash ? "3" : "2";

	return {
		date: new Date().toISOString().split("T")[0],
		total_price: Math.round(summary.total),
		payed_money: isCash ? parseCashAmount(cashAmount) : 0,
		change_money: isCash ? change : 0,
		is_paid: initialIsPaid,
		market_id: marketId,
		user_id: userId,
		items: JSON.stringify(itemsPayload),
		payment_method_id: paymentMethodId,
		payment_id: paymentId,
		total_weight_qty: totalWeightQty,
		totol_pcs_qty: cart.reduce((acc, item) => acc + item.qty, 0),
		price: Math.round(summary.subTotalNet),
		per_item_disc: summary.totalItemDiscount,
		voucher_disc: summary.voucherDiscount,
		total_disc: Math.round(summary.totalItemDiscount + summary.voucherDiscount),
		tax_price: summary.tax,
		online_order: "1",
		note: "",
	};
}

/**
 * Enrich raw API transaction response with user, market, payment info
 * so invoice generation has all needed nested data.
 */
export function enrichTransactionForInvoice(
	tx: Record<string, unknown>,
	user: User | null,
	paymentMethodName: string,
): Record<string, unknown> {
	return {
		...tx,
		user: tx.user || {
			name: user?.name || "-",
			username: user?.username || "-",
		},
		market: tx.market || {
			name: tx.market_name || "-",
		},
		payment: tx.payment || {
			name: tx.payment_method || paymentMethodName || "-",
		},
		member: tx.member || null,
	};
}
