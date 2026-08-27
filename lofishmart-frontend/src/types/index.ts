export interface User {
	id: string;
	name: string;
	username: string;
	email: string;
	login: boolean;
	hasPermit: string[];
	role_id?: string;
	role?: {
		id: string;
		name: string;
	};
	market?: {
		id: string;
		name: string;
	};
	market_id?: string;
	image?: string;
}

export interface LoginResponse {
	message: string;
	token: string;
	user: User;
}

export interface FishType {
	code: string;
	name: string;
}

// UI Product Interface
export interface Product {
	id: string; // This will map to the Price List ID
	productId: string;
	barcode: string;
	productBarcode: string;
	name: string;
	basePrice: number;
	category: string;
	image: string;
	stock: number;
	stockId?: string;
	unit: "KG" | "PCS";
	hasVariants: boolean;
	variants?: { grade: string; price: number }[];
	size?: string;
	grade?: string;
	useGradingSystem?: boolean;
	type: "PRODUCT" | "SERVICE";
	is_non_stock?: string;
	disc?: number;
	initialPrice?: number;
	isShow?: boolean;
	isNonStock?: boolean;
	categoryId?: string;
	sizeId?: string;
	gradeId?: string;
}

export interface CartItem extends Product {
	qty: number;
	discount: number;
	subtotal: number;
	selectedGrade?: string;
	selectedSize?: string;
	selectedQuality?: string;
	measuredWeight?: number; // Weight from scale
	source?: "manual" | "serial"; // Added source to distinguish
	cartId: string; // Unique ID in cart
}

// API Response Interfaces
export interface ApiProductCategory {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
}

export interface ApiProductSize {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
}

export interface ApiProductGrade {
	id: string;
	name: string;
	created_at: string;
	updated_at: string;
}

export interface ApiProductDetail {
	id: string;
	name: string;
	barcode: string;
	unit: string;
	is_non_stock: string;
	is_show: string;
	image: string;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	category: ApiProductCategory;
}

export interface ProductResponse {
	id: string;
	barcode: string;
	initial: number;
	selling: number;
	disc: number;
	created_at: string;
	updated_at: string;
	product: ApiProductDetail;
	grade: ApiProductGrade;
	size: ApiProductSize;
}

export interface ServiceResponse {
	id: string;
	name: string;
	barcode: string;
	unit: string;
	price: number;
	disc: number;
	image: string;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
}

export type PaymentMethod = "CASH" | "QRIS" | "OTHER";

export interface ScaleData {
	itemCode: string;
	weight: number;
	price: number;
	status: boolean;
	scaleId: string;
}

export interface SerialResponse {
	name: string;
	code: string;
	base_price: number;
	total_price: number;
	weight: number;
	type: string;
}

export interface CartSummary {
	grossTotal: number;
	totalItemDiscount: number;
	subTotalNet: number;
	tax: number;
	voucherDiscount: number;
	total: number;
}

export interface XenditQRResponse {
	id: string;
	external_id: string;
	reference_id: string;
	amount: number;
	qr_string: string;
	status: string;
	created: string;
	updated: string;
	expires_at?: string;
}

export interface Profile {
	id: string;
	market_name: string;
	address: string;
	contact: string;
	logo: string;
	// Add other fields as necessary
}

export interface MarketProfile {
	id: string;
	name: string;
	address: string;
	maps: string;
	city: string;
	pos: string;
	timezone: string;
	time_dif: number;
	type: 'GUDANG' | 'OUTLET';
	phone_number: string;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
}

export interface TransactionItem {
	id: string;
	product_name: string;
	qty: number;
	price: number;
	subtotal: number;
}

export interface Transaction {
	id: string;
	code: string;
	total_weight_qty: number;
	total_pcs_qty: number;
	price: number;
	per_item_disc: number;
	voucher_disc: number;
	total_disc: number;
	tax_price: number;
	total_price: number;
	payed_money: number;
	change_money: number;
	is_paid: string;
	online_order: string;
	note: string | null;
	transaction_date: string;
	payment_method: string;
	payment_method_id?: string | null;
	cashier_name: string;
	market_name: string;
	customer_name: string;
	member_id?: string | null;
}

// Selling Product Detail - items sold within a selling transaction
export interface SellingProductDetail {
	id: string;
	selling_id: string;
	qty: number;
	mod_price: number;
	total_price: number;
	note: string | null;
	created_at: string;
	updated_at: string;
	// Nested selling info
	selling_user_name: string;
	selling_market_name: string;
	selling_payment_name: string;
	selling_is_paid: string;
	// Stock/price info (can be null)
	stock_name: string | null;
	price_value: number | null;
	// Pre-constructed parent transaction (from embedded selling data)
	_transaction?: Transaction;
	// New fields for details
	total_weight?: number;
	grade?: string;
	size?: string;
	image?: string | null;
}

// Selling Service Detail - services rendered within a selling transaction
export interface SellingServiceDetail {
	id: string;
	selling_id: string;
	qty: number;
	mod_price: number;
	total_price: number;
	note: string | null;
	/** Name of the service (from the eager `service` relation) */
	service_name?: string | null;
	created_at: string;
	updated_at: string;
	// Nested selling info
	selling_user_name: string;
	selling_market_name: string;
	selling_payment_name: string;
	selling_is_paid: string;
	// Pre-constructed parent transaction (from embedded selling data)
	_transaction?: Transaction;
}

export interface CreateTransactionItem {
	type?: "PRODUCT" | "SERVICE";
	stock_id?: string;
	stock?: string;
	qty: number;
	price?: number;
	price_id?: string;
	service_id?: string;
	total_price: number;
	mod_price: number;
	note: string;
	total_weight?: number;
}

export interface ApiSellingProductDetail {
	id: string;
	qty: number;
	mod_price: number;
	total_price: number;
	note: string;
	created_at: string;
	updated_at: string;
	total_weight?: string | number; // Added total_weight from API
	selling: {
		id: string;
		is_paid: string;
		user: { name: string };
		market: { name: string };
		payment: { name: string } | null;
	}; // Simplified
	stock: {
		id: string;
		product: {
			id: string;
			name: string;
		};
	} | null;
	price: {
		id: string;
		selling: number;
		grade?: { name: string }; // Added grade relation
		size?: { name: string }; // Added size relation
		product: {
			id: string;
			name: string;
			image: string;
		};
	} | null;
}

export interface CreateTransactionRequest {
	date: string; // YYYY-MM-DD
	total_price: number;
	payed_money: number;
	change_money: number;
	is_paid: string; // "1" or "0"
	payment_method_id?: string; // Optional if using payment_id
	market_id: string;
	user_id: string;
	items: string; // JSON stringified array of CreateTransactionItem

	// New fields
	payment_id?: string;
	total_weight_qty: number;
	totol_pcs_qty: number; // typo in backend
	price: number; // subtotal before tax/disc? or same as total?
	per_item_disc: number;
	voucher_disc: number;
	total_disc: number;
	tax_price: number;
	online_order: string; // "1" or "0"
	note: string;
	member_id?: string;
	voucher_id?: string;
}

export interface MarketStock {
	marketId: string;
	marketName: string;
	[productName: string]: string | number;
}

export const UnitType = {
	KG: "1",
	PCS: "2",
} as const;
export type UnitType = typeof UnitType[keyof typeof UnitType];

export const TransferStatus = {
	SENDING: "SENDING",
	WAITING_VERIFICATION: "WAITING_VERIFICATION",
	DONE: "DONE",
	CANCELLED: "CANCELLED",
} as const;
export type TransferStatus = typeof TransferStatus[keyof typeof TransferStatus];

export interface Purchase {
	id: string;
	batch: string | null;
	qty: number;
	price: number;
	unit: UnitType;
	image_proof: string | null;
	created_at: string;
	product: {
		id: string;
		name: string;
		category?: { id: string; name: string };
	} | null;
	supplier: { id: string; name: string; corporation?: string } | null;
	warehouse: { id: string; name: string } | null;
	user?: { id: string; username: string; name?: string } | null;
}

export interface StockTransfer {
	id: string;
	qty: number;
	unit: UnitType;
	status: TransferStatus;
	notes?: string | null;
	created_at?: string | null;
	created_by?: { id?: string; name?: string } | null;
	verified_by?: { id?: string; name?: string } | null;
	verified_qty?: number | null;
	verified_notes?: string | null;
	sent_at?: string | null;
	verified_at?: string | null;
	transfer_group?: string | null;
	image_proof?: string | null;
	product?: { id: string; name: string } | null;
	source_stock?: {
		warehouse?: { id: string; name: string; address?: string | null } | null;
		/** Typo-variant of `warehouse` used across transfer-related views/backed API. */
		werehouse?: { id: string; name: string; address?: string | null } | null;
	} | null;
	target_market?: {
		id: string;
		name: string;
		address?: string | null;
		type?: string | null;
	} | null;
}

export interface GroupedPurchase {
	id: string; // Using batch or first item id
	date: string;
	supplierName: string;
	warehouseName: string;
	imageProof: string | null;
	totalAmount: number;
	items: Purchase[];
	userName?: string;
}

export interface BaseResponse<T = unknown> {
	message: string;
	data?: T;
}

export interface ProductPayload {
	type: "PRODUCT" | "SERVICE";
	name: string;
	barcode?: string;
	unit: "KG" | "PCS";
	basePrice?: number;
	price?: number;
	disc?: number;
	imageFile?: File;
	image?: string;
	categoryId?: string;
	isShow?: boolean;
	isNonStock?: boolean;
	variants?: {
		id?: string;
		sizeId: string;
		gradeId: string;
		basePrice: number;
		barcode?: string;
	}[];
	initialPrice?: number;
	sizeId?: string;
	gradeId?: string;
	productId?: string; // Used for updates
}
