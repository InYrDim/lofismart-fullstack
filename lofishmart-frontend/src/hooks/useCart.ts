import { useEffect } from "react";
import { useStorage } from "./useStorage";
import { useVoucher } from "./useVoucher";
import type { Product, CartItem } from "@/types";
import { SIZES, QUALITY_CRITERIA } from "@/utils/grading";

export const useCart = () => {
	const [cart, setCart] = useStorage<CartItem[]>("lofish_cart", []);
	const {
		activeVoucher,
		activeConfig,
		globalDiscount: voucherDiscount,
		setGlobalDiscount: setVoucherDiscount,
		getStrategy,
		checkVoucher,
		clearVoucher,
		isLoading: isVoucherLoading,
		error: voucherError,
	} = useVoucher();

	// Helper: Hitung harga satuan item
	const getItemPrice = (item: CartItem) => {
		let price = item.basePrice;

		// LOGIKA HARGA LAMA (Legacy Variants)
		if (item.hasVariants && item.variants) {
			const v = item.variants.find((v) => v.grade === item.selectedGrade);
			if (v) price = v.price;
		}

		// LOGIKA HARGA BARU (Grading System)
		if (item.useGradingSystem && item.selectedSize && item.selectedQuality) {
			const sizeMultiplier =
				SIZES.find((s) => s.id === item.selectedSize)?.priceMultiplier || 1;
			const qualityMultiplier =
				QUALITY_CRITERIA.find((q) => q.id === item.selectedQuality)
					?.priceMultiplier || 1;

			// Harga = Base * Size * Quality
			price = item.basePrice * sizeMultiplier * qualityMultiplier;
		}

		// LOGIKA SCALE (Measured Weight)
		if (item.measuredWeight !== undefined && item.measuredWeight >= 0) {
			// Price = Initial (Base) * Weight
			price = item.basePrice * item.measuredWeight;
		} else {
			price = 0;
		}

		return price;
	};

	// Effect: Recalculate cart when voucher changes
	useEffect(() => {
		// We pass 'cart' from state, which is the current cart.
		// If activeConfig changes, this will re-run the calculation with the new strategy.
		if (cart.length > 0) {
			updateCartState(cart);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeConfig, activeVoucher]); // Only run when voucher changes

	const calculateCartWithVoucher = (currentCart: CartItem[]) => {
		// No strategy if no active config/voucher
		if (!activeVoucher || !activeConfig) {
			return { updatedItems: currentCart, globalDisc: 0 };
		}

		const strategy = getStrategy();

		let globalDisc = 0;
		if (strategy?.calculateGlobalDiscount) {
			globalDisc = strategy.calculateGlobalDiscount(currentCart);
		}

		const updatedItems = currentCart.map((item) => {
			const price = getItemPrice(item); // Ini Base Price (atau variants)

			// 1. Hitung Product Discount (bawaan API)
			const productDisc = (item.disc || 0) * item.qty;

			// 2. Hitung Voucher Discount via Strategy
			let voucherDisc = 0;
			if (strategy?.calculateItemDiscount) {
				voucherDisc = strategy.calculateItemDiscount(item, price, item.qty);
			}

			const totalDisc = productDisc + voucherDisc;

			return {
				...item,
				subtotal: price * item.qty, // Simpan harga kotor (Gross)
				discount: totalDisc, // Total Diskon (Produk + Voucher)
			};
		});

		return { updatedItems, globalDisc };
	};

	const updateCartState = (newCart: CartItem[]) => {
		if (activeVoucher) {
			const { updatedItems, globalDisc } = calculateCartWithVoucher(newCart);
			setCart(updatedItems);
			setVoucherDiscount(globalDisc);
		} else {
			// Recalculate subtotal & discount standard (tanpa voucher)
			const recalc = newCart.map((item) => {
				const price = getItemPrice(item);
				return {
					...item,
					subtotal: price * item.qty, // Gross Price
					discount: (item.disc || 0) * item.qty, // Product Discount only
				};
			});
			setCart(recalc);
			setVoucherDiscount(0); // Ensure global discount is reset if no voucher
		}
	};

	const getCartTotalWeightForProduct = (productId: string, excludeCartId?: string) => {
		return cart
			.filter((item) => item.id === productId && item.cartId !== excludeCartId)
			.reduce((sum, item) => sum + (item.measuredWeight || 1) * item.qty, 0);
	};

	const canAddToCart = (product: Product, additionalWeight: number = 1, excludeCartId?: string) => {
		if (product.type === "SERVICE") return true;
		if (product.is_non_stock === "2" || product.isNonStock) return true;

		const currentCartWeight = getCartTotalWeightForProduct(product.id, excludeCartId);
		const availableStock = product.stock || 0;

		return currentCartWeight + additionalWeight <= availableStock;
	};

	const addToCart = (product: Product) => {
		if (!canAddToCart(product)) return;

		const newCart = [...cart];
		const existingIndex = newCart.findIndex(
			(item) => item.id === product.id && item.source === "manual"
		);

		if (existingIndex >= 0) {
			const item = newCart[existingIndex];
			const newQty = item.qty + 1;
			newCart[existingIndex] = {
				...item,
				qty: newQty,
				discount: 0,
			};
		} else {
			const newItem: CartItem = {
				...product,
				qty: 1,
				discount: 0,
				subtotal: 0,
				measuredWeight: 1,
				source: "manual",
				cartId: `manual-${Date.now()}-${Math.random()
					.toString(36)
					.substr(2, 9)}`,
			};

			if (product.hasVariants && product.variants) {
				newItem.selectedGrade = product.variants[0].grade;
			}

			if (product.useGradingSystem) {
				newItem.selectedSize = "2";
				newItem.selectedQuality = "1";
			}

			newCart.push(newItem);
		}

		updateCartState(newCart);
	};

	const updateQuantity = (cartId: string, delta: number) => {
		if (delta > 0) {
			const item = cart.find((i) => i.cartId === cartId);
			if (item) {
				const additionalWeight = delta * (item.measuredWeight || 1);
				if (!canAddToCart(item, additionalWeight, cartId)) return;
			}
		}

		const newCart = cart
			.map((item) => {
				if (item.cartId === cartId) {
					const newQty = item.qty + delta;
					if (newQty <= 0) return null;
					return { ...item, qty: newQty };
				}
				return item;
			})
			.filter((item): item is CartItem => item !== null);

		updateCartState(newCart);
	};

	// Legacy Variant Update
	const updateGrade = (cartId: string, newGrade: string) => {
		const newCart = cart.map((item) => {
			if (item.cartId === cartId) {
				return { ...item, selectedGrade: newGrade };
			}
			return item;
		});
		updateCartState(newCart);
	};

	// NEW: Grading Update (Size or Quality)
	const updateGrading = (
		cartId: string,
		type: "size" | "quality",
		value: string
	) => {
		const newCart = cart.map((item) => {
			if (item.cartId === cartId) {
				const updates: Partial<CartItem> = {};
				if (type === "size") updates.selectedSize = value;
				if (type === "quality") updates.selectedQuality = value;
				return { ...item, ...updates };
			}
			return item;
		});
		updateCartState(newCart);
	};
	const addScaleItem = (product: Product, weight: number): boolean => {
		if (!canAddToCart(product, weight)) return false;

		const existingIndex = cart.findIndex(
			(item) => item.id === product.id && item.measuredWeight === weight
		);
		const newCart = [...cart];

		if (existingIndex >= 0) {
			const item = newCart[existingIndex];
			newCart[existingIndex] = {
				...item,
				qty: item.qty + 1,
				discount: 0,
			};
		} else {
			const newItem: CartItem = {
				...product,
				qty: 1,
				discount: 0,
				subtotal: 0,
				measuredWeight: weight,
				selectedSize: "2",
				selectedQuality: "1",
				source: "serial",
				cartId: `serial-${Date.now()}-${Math.random()
					.toString(36)
					.substr(2, 9)}`,
			};
			newCart.push(newItem);
		}
		updateCartState(newCart);
		return true;
	};

	const removeFromCart = (cartId: string) => {
		const newCart = cart.filter((item) => item.cartId !== cartId);
		updateCartState(newCart);
	};

	// Updated applyVoucher to be async because it checks the service
	const applyVoucher = async (code: string) => {
		// 1. Validate via Voucher Service
		const config = await checkVoucher(code);

		if (!config) {
			clearVoucher();
			// updateCartState will be triggered by useEffect when activeVoucher/activeConfig changes to null
		}
		// If config exists, checkVoucher has already updated the state (activeVoucher/activeConfig).
		// The useEffect above will detect the change and trigger updateCartState.
	};

	const clearCart = () => {
		setCart([]);
		clearVoucher(); // Use the clear from hook
	};

	// Totals
	const grossTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
	const totalItemDiscount = cart.reduce((acc, item) => acc + item.discount, 0);
	const subTotalNet = grossTotal - totalItemDiscount;
	const tax = 0; // Tax set to 0 as per user request
	const total = Math.max(0, subTotalNet + tax - voucherDiscount);

	const summary = {
		grossTotal,
		totalItemDiscount,
		subTotalNet,
		tax,
		voucherDiscount,
		total,
	};

	return {
		cart,
		activeVoucher,
		voucherDiscount,
		addToCart,
		updateQuantity,
		updateGrade,
		updateGrading, // Export fungsi baru
		addScaleItem,
		removeFromCart,
		clearCart,
		applyVoucher,
		summary,
		isVoucherLoading, // Export new state
		voucherError, // Export new state
	};
};
