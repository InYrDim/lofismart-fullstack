import { api } from "@/utils/api";
import { generateMasterId } from "@/utils";
import { storage } from "@/utils/storage";
import type {
	Product,
	ProductResponse,
	ServiceResponse,
	ApiProductDetail,
	MarketStock,
	BaseResponse,
	ProductPayload,
} from "@/types";
import {
	type StockResponse,
	type MasterCategory,
	type MasterSize,
	type MasterGrade,
	mergeProductsWithStock,
	deduplicatePrices,
	mapToProduct,
	mapToBaseProduct,
	mapToService,
} from "./product.utils";

export type { MasterCategory, MasterSize, MasterGrade, StockResponse };

export const ProductService = {
	getProducts: async (marketId?: string): Promise<Product[]> => {
		try {
			const targetMarketId = marketId || storage.getMarketId();

			const [productRes, serviceRes] = await Promise.all([
				api.get<{ data: ProductResponse[] }>("/product/price/list"),
				api.get<{ data: ServiceResponse[] }>("/product/service/list"),
			]);

			const products = productRes.data.map(mapToProduct);
			const services = serviceRes.data.map(mapToService);
			const allProducts = [...products, ...services];

			if (targetMarketId) {
				try {
					const stockRes = await api.get<{ data: StockResponse[] }>(
						`/product/stock/list?market_id=${encodeURIComponent(targetMarketId)}`,
					);
					if (stockRes.data && Array.isArray(stockRes.data)) {
						const merged = mergeProductsWithStock(allProducts, stockRes.data);
						return deduplicatePrices(merged);
					}
				} catch (stockError) {
					console.warn("Failed to fetch stock data:", stockError);
				}
			}

			return deduplicatePrices(allProducts);
		} catch (error) {
			console.error("Failed to fetch products/services:", error);
			throw error;
		}
	},

	getBaseProducts: async (): Promise<Product[]> => {
		try {
			const [productRes, serviceRes] = await Promise.all([
				api.get<{ data: ApiProductDetail[] }>("/product/product/list"),
				api.get<{ data: ServiceResponse[] }>("/product/service/list"),
			]);

			const products = productRes.data.map(mapToBaseProduct);
			const services = serviceRes.data.map(mapToService);

			return [...products, ...services];
		} catch (error) {
			console.error("Failed to fetch base products/services:", error);
			throw error;
		}
	},

	getCategories: async (): Promise<MasterCategory[]> => {
		const res = await api.get<{ data: MasterCategory[] }>("/product/category/list");
		return res.data;
	},

	getSizes: async (): Promise<MasterSize[]> => {
		const res = await api.get<{ data: MasterSize[] }>("/product/size/list");
		return res.data;
	},

	getGrades: async (): Promise<MasterGrade[]> => {
		const res = await api.get<{ data: MasterGrade[] }>("/product/grade/list");
		return res.data;
	},

	// ── Category CRUD ────────────────────────────────────────────────────
	createCategory: async (
		name: string,
		barcode: string,
	): Promise<BaseResponse<MasterCategory>> => {
		return api.post("/product/category/create", {
			id: generateMasterId(),
			name,
			barcode,
		});
	},
	updateCategory: async (
		id: string,
		name: string,
		barcode: string,
	): Promise<BaseResponse<MasterCategory>> => {
		return api.patch(`/product/category/update/${id}`, { name, barcode });
	},
	deleteCategory: async (id: string): Promise<BaseResponse> => {
		return api.delete(`/product/category/delete/${id}`);
	},

	// ── Grade CRUD ───────────────────────────────────────────────────────
	createGrade: async (
		name: string,
		barcode: string,
	): Promise<BaseResponse<MasterGrade>> => {
		return api.post("/product/grade/create", {
			id: generateMasterId(),
			name,
			barcode,
		});
	},
	updateGrade: async (
		id: string,
		name: string,
		barcode: string,
	): Promise<BaseResponse<MasterGrade>> => {
		return api.patch(`/product/grade/update/${id}`, { name, barcode });
	},
	deleteGrade: async (id: string): Promise<BaseResponse> => {
		return api.delete(`/product/grade/delete/${id}`);
	},

	// ── Size CRUD ────────────────────────────────────────────────────────
	createSize: async (
		name: string,
		barcode: string,
	): Promise<BaseResponse<MasterSize>> => {
		return api.post("/product/size/create", {
			id: generateMasterId(),
			name,
			barcode,
		});
	},
	updateSize: async (
		id: string,
		name: string,
		barcode: string,
	): Promise<BaseResponse<MasterSize>> => {
		return api.patch(`/product/size/update/${id}`, { name, barcode });
	},
	deleteSize: async (id: string): Promise<BaseResponse> => {
		return api.delete(`/product/size/delete/${id}`);
	},

	createProduct: async (data: ProductPayload): Promise<Product | ServiceResponse> => {
		if (data.type === "SERVICE") {
			const formData = new FormData();
			formData.append("name", data.name);
			formData.append("barcode", data.barcode || "");
			formData.append(
				"price",
				data.basePrice?.toString() ?? data.price?.toString() ?? "0",
			);
			formData.append("unit", data.unit === "PCS" ? "2" : "1");
			if (data.disc !== undefined)
				formData.append("disc", data.disc.toString());
			if (data.imageFile) formData.append("image", data.imageFile);

			const res = await api.post<BaseResponse<ServiceResponse>>("/product/service/create", formData);
			if (!res.data) throw new Error("Gagal membuat layanan");
			return res.data;
		} else {
			// Product Physical (Variants handling)
			if (data.variants && data.variants.length > 0) {
				// 1 Product, Many Prices
				const formData = new FormData();
				formData.append("name", data.name);
				formData.append("barcode", data.barcode || "");
				formData.append("unit", data.unit === "PCS" ? "2" : "1");
				formData.append("category", data.categoryId || "");
				formData.append("is_show", data.isShow ? "1" : "2");
				formData.append("is_non_stock", data.isNonStock ? "2" : "1");
				if (data.imageFile) formData.append("image", data.imageFile);

				const productRes = await api.post<BaseResponse<ApiProductDetail>>(
					"/product/product/create",
					formData,
				);
				if (!productRes.data) throw new Error("Gagal membuat produk");
				const productId = productRes.data.id;

				for (const variant of data.variants) {
					await api.post("/product/price/create", {
						product: productId,
						size: variant.sizeId, // Size is now sent to Price!
						grade: variant.gradeId,
						selling: variant.basePrice,
						barcode: variant.barcode || "",
						initial: data.initialPrice || 0,
						disc: data.disc || 0,
					});
				}

				return mapToBaseProduct(productRes.data);
			} else {
				// Fallback to old behavior if no variants provided
				const formData = new FormData();
				formData.append("name", data.name);
				formData.append("barcode", data.barcode || "");
				formData.append("unit", data.unit === "PCS" ? "2" : "1");
				if (!data.categoryId) throw new Error("Kategori harus dipilih");
				if (!data.sizeId) throw new Error("Ukuran harus dipilih");
				if (!data.gradeId) throw new Error("Grade harus dipilih");

				formData.append("category", data.categoryId);
				formData.append("is_show", data.isShow ? "1" : "2");
				formData.append("is_non_stock", data.isNonStock ? "2" : "1");
				if (data.imageFile) formData.append("image", data.imageFile);

				const productRes = await api.post<BaseResponse<ApiProductDetail>>(
					"/product/product/create",
					formData,
				);
				if (!productRes.data) throw new Error("Gagal membuat produk");
				const productId = productRes.data.id;

				// Step 2: Create Price
				await api.post("/product/price/create", {
					product: productId,
					size: data.sizeId,
					grade: data.gradeId,
					selling: data.basePrice,
					initial: data.initialPrice || 0,
					disc: data.disc || 0,
				});

				return mapToBaseProduct(productRes.data);
			}
		}
	},

	updateProduct: async (id: string, data: ProductPayload): Promise<BaseResponse<ApiProductDetail | ServiceResponse>> => {
		if (data.type === "SERVICE") {
			const formData = new FormData();
			if (data.name) formData.append("name", data.name);
			if (data.barcode) formData.append("barcode", data.barcode);
			if (data.basePrice !== undefined)
				formData.append("price", data.basePrice.toString());
			if (data.unit) formData.append("unit", data.unit === "PCS" ? "2" : "1");
			if (data.disc !== undefined) formData.append("disc", data.disc.toString());
			// Image: upload baru jika ada, kirim sinyal "keep" jika gambar lama masih ada
			if (data.imageFile) formData.append("image", data.imageFile);
			else if (data.image) formData.append("image", "keep_existing_image");

			return api.put(`/product/service/update/${id}`, formData);
		} else {
			const formData = new FormData();
			if (data.name) formData.append("name", data.name);
			if (data.barcode) formData.append("barcode", data.barcode);
			if (data.unit) formData.append("unit", data.unit === "PCS" ? "2" : "1");
			if (data.categoryId) formData.append("category", data.categoryId);
			else throw new Error("Kategori harus dipilih");

			const hasVariants =
				data.variants &&
				Array.isArray(data.variants) &&
				data.variants.length > 0;
			if (data.sizeId) formData.append("size", data.sizeId);
			else if (!hasVariants) throw new Error("Ukuran harus dipilih");

			if (data.gradeId) formData.append("grade", data.gradeId);
			else if (!hasVariants) throw new Error("Grade harus dipilih");
			if (data.isShow !== undefined)
				formData.append("is_show", data.isShow ? "1" : "2");
			if (data.isNonStock !== undefined)
				formData.append("is_non_stock", data.isNonStock ? "2" : "1");

			if (data.imageFile) {
				formData.append("image", data.imageFile);
			} else if (data.image) {
				// Prevent backend from nullifying existing image when req.body.image is undefined
				formData.append("image", "keep_existing_image");
			}

			let productRes: BaseResponse<ApiProductDetail> | undefined;

			if (data.variants && Array.isArray(data.variants)) {
				// Single Product Patch
				productRes = await api.put<BaseResponse<ApiProductDetail>>(
					`/product/product/update/${data.productId}`,
					formData,
				);

				const currentPricesResp = await api.get<{ data: ProductResponse[] }>(
					"/product/price/list",
				);
				const currentPrices = currentPricesResp.data;

				// Find existing prices linked strictly to THIS product ID
				const existingPricesForThisProduct = currentPrices.filter(
					(p) => p.product.id === data.productId,
				);

				const newVariantIds = data.variants.map((v) => v.id);

				// Build a set of IDs confirmed to exist in the DB — the only reliable
				// way to tell "existing" from "newly added client-side" variants.
				const existingPriceIds = new Set(existingPricesForThisProduct.map((p) => p.id));

				// Delete removed variants
				for (const cp of existingPricesForThisProduct) {
					if (!newVariantIds.includes(cp.id) && cp.id) {
						await api
							.delete(`/product/price/delete/${cp.id}`)
							.catch((e) => console.warn("Failed to delete price", e));
					}
				}

				for (const variant of data.variants) {
					// A variant is NEW only if its ID isn't found in the prices
					// we just fetched from the DB. No fragile format guessing.
					const isNew = !variant.id || !existingPriceIds.has(variant.id);
					if (!isNew) {
						// Update existing Price (now updating size too!)
						await api.put(`/product/price/update/${variant.id}`, {
							selling: variant.basePrice,
							grade: variant.gradeId,
							size: variant.sizeId,
							barcode: variant.barcode || "",
						});
					} else {
						// Create new Price for this existing Product
						await api.post("/product/price/create", {
							product: data.productId,
							size: variant.sizeId,
							grade: variant.gradeId,
							selling: variant.basePrice,
							barcode: variant.barcode || "",
							initial: 0,
							disc: 0,
						});
					}
				}
			} else if (data.basePrice !== undefined && !data.variants) {
				// Single fallback
				productRes = await api.put<BaseResponse<ApiProductDetail>>(
					`/product/product/update/${data.productId}`,
					formData,
				);

				await api.put(`/product/price/update/${id}`, {
					selling: data.basePrice,
					grade: data.gradeId,
					barcode: data.barcode || "",
				});
			}

			if (!productRes) {
				throw new Error("Gagal memperbarui produk: Data tidak lengkap.");
			}

			return productRes;
		}
	},

	toggleArchive: async (
		id: string,
		type: "PRODUCT" | "SERVICE",
		isShow: boolean,
	): Promise<void> => {
		const newIsShow = isShow ? "2" : "1"; // toggle: if currently shown, archive it (2); if archived, restore it (1)
		if (type === "SERVICE") {
			const formData = new FormData();
			formData.append("is_show", newIsShow);
			formData.append("image", "keep_existing_image");
			await api.put(`/product/service/update/${id}`, formData);
		} else {
			const formData = new FormData();
			formData.append("is_show", newIsShow);
			formData.append("image", "keep_existing_image");
			await api.put(`/product/product/update/${id}`, formData);
		}
	},

	deleteProduct: async (
		id: string,
		type: "PRODUCT" | "SERVICE",
	): Promise<void> => {
		if (type === "SERVICE") {
			await api.delete(`/product/service/delete/${id}`);
		} else {
			// `id` from getBaseProducts is actually the Product ID, not the Price ID.
			// 1. Fetch all prices to find which ones belong to this product
			const currentPricesResp = await api.get<{ data: ProductResponse[] }>(
				"/product/price/list",
			);
			const pricesToDelete = currentPricesResp.data.filter(
				(p) => p.product.id === id,
			);

			// 2. Delete all related price entries
			for (const price of pricesToDelete) {
				await api
					.delete(`/product/price/delete/${price.id}`)
					.catch((e) => console.warn("Failed to delete price variant", e));
			}

			// 3. Delete the base product
			await api.delete(`/product/product/delete/${id}`).catch(() => {
				// Fallback to soft-delete if hard delete isn't available
				api
					.delete(`/product/product/soft-delete/${id}`)
					.catch((err) => console.warn("Failed to soft-delete product", err));
			});
		}
	},

	getInventoryDashboard: async (): Promise<MarketStock[]> => {
		try {
			const res = await api.get<{ data: MarketStock[] }>("/product/inventory/dashboard");
			return res.data || [];
		} catch (error: unknown) {
			console.error("Failed to fetch inventory dashboard:", error);
			throw error;
		}
	},
};


