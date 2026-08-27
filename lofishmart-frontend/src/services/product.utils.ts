import { getImgUrl } from "@/utils";
import type {
	Product,
	ProductResponse,
	ServiceResponse,
	ApiProductDetail,
} from "@/types";

export interface StockResponse {
	id: string;
	qty: number;
	product: ApiProductDetail;
	market?: { id: string; name: string };
	warehouse?: { id: string; name: string };
}

export interface MasterCategory {
	id: string;
	name: string;
	barcode: string;
}
export interface MasterSize {
	id: string;
	name: string;
	barcode: string;
}
export interface MasterGrade {
	id: string;
	name: string;
	barcode: string;
}

export function mergeProductsWithStock(
	products: Product[],
	stockData: StockResponse[],
): Product[] {
	const stockByProductId = new Map<string, { qty: number; stockId?: string }>();

	for (const stock of stockData) {
		const productId = stock.product?.id;
		if (!productId) continue;

		const existing = stockByProductId.get(productId);
		if (existing) {
			existing.qty += stock.qty;
		} else {
			stockByProductId.set(productId, {
				qty: stock.qty,
				stockId: stock.id,
			});
		}
	}

	return products.map((product) => {
		if (product.type === "SERVICE") {
			return { ...product, stock: 0 };
		}

		const stockInfo = stockByProductId.get(product.productId);
		if (stockInfo) {
			return {
				...product,
				stock: stockInfo.qty,
				stockId: stockInfo.stockId,
			};
		}

		return { ...product, stock: 0 };
	});
}

export function deduplicatePrices(products: Product[]): Product[] {
	const seen = new Map<string, Product>();
	const result: Product[] = [];

	for (const product of products) {
		if (product.type === "SERVICE") {
			result.push(product);
			continue;
		}

		const key = `${product.productId}-${product.sizeId || ""}-${product.gradeId || ""}`;

		if (seen.has(key)) {
			const existing = seen.get(key)!;
			if (product.stock > existing.stock) {
				seen.set(key, product);
			}
		} else {
			seen.set(key, product);
		}
	}

	for (const [, product] of seen) {
		result.push(product);
	}

	return result;
}

export const mapToProduct = (item: ProductResponse): Product => {
	const imageUrl = getImgUrl(item.product.image, "product");

	return {
		id: item.id,
		productId: item.product.id,
		barcode: item.barcode || item.product.barcode || "",
		productBarcode: item.product.barcode,
		name: item.product.name,
		basePrice: item.selling,
		category: item.product.category?.name || "Uncategorized",
		categoryId: item.product.category?.id,
		image: imageUrl,
		stock: 0,
		unit: item.product.unit === "2" ? "PCS" : "KG",
		hasVariants: false,
		size: item.size?.name,
		sizeId: item.size?.id,
		grade: item.grade?.name,
		gradeId: item.grade?.id,
		type: "PRODUCT",
		is_non_stock: item.product.is_non_stock,
		isNonStock: item.product.is_non_stock === "2",
		disc: item.disc,
		initialPrice: item.initial,
		isShow: item.product.is_show === "1",
		useGradingSystem: false,
	};
};

export const mapToBaseProduct = (item: ApiProductDetail): Product => {
	const imageUrl = getImgUrl(item.image, "product");

	return {
		id: item.id, // Base product ID
		productId: item.id,
		barcode: item.barcode || "",
		productBarcode: item.barcode || "",
		name: item.name,
		basePrice: 0, // Base products don't strictly have a base price, they rely on variants
		category: item.category?.name || "Uncategorized",
		categoryId: item.category?.id,
		image: imageUrl,
		stock: 0,
		unit: item.unit === "2" ? "PCS" : "KG",
		hasVariants: true,
		size: undefined,
		sizeId: undefined,
		type: "PRODUCT",
		is_non_stock: item.is_non_stock,
		isNonStock: item.is_non_stock === "2",
		isShow: item.is_show === "1",
		useGradingSystem: false,
	};
};

export const mapToService = (item: ServiceResponse): Product => {
	const imageUrl = getImgUrl(item.image, "service");

	return {
		id: item.id,
		productId: item.id,
		barcode: item.barcode || "",
		productBarcode: item.barcode || "",
		name: item.name,
		basePrice: item.price,
		category: "SERVICE",
		image: imageUrl,
		stock: 0,
		unit: item.unit === "2" ? "PCS" : "KG",
		hasVariants: false,
		type: "SERVICE",
		disc: item.disc,
		initialPrice: item.price,
		isShow: true,
		useGradingSystem: false,
	};
};
