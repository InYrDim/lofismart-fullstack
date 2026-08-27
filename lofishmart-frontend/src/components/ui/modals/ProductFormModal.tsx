import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import {
	ProductService,
	type MasterCategory,
	type MasterSize,
	type MasterGrade,
} from "@/services/product.service";
import { Save, Package, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceVariantModal, type PriceVariantData } from "./PriceVariantModal";
import { ImageCropModal } from "./ImageCropModal";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { BasicInfoTab } from "./ProductForm/BasicInfoTab";
import { VariantsTab } from "./ProductForm/VariantsTab";
import { SettingsTab } from "./ProductForm/SettingsTab";
import { useImageEditor } from "@/hooks/useImageEditor";
import type { Product } from "@/types";

interface ProductFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	productId?: string | null;
	onSuccess: () => void;
}

interface MasterData {
	categories: MasterCategory[];
	sizes: MasterSize[];
	grades: MasterGrade[];
	existingBarcodes: string[];
}

interface LoadedProductData {
	name: string;
	barcode: string;
	basePrice: number;
	disc: number;
	type: "PRODUCT";
	unit: "PCS" | "KILOGRAM";
	isShow: boolean;
	isNonStock: boolean;
	categoryId: string;
	variants: PriceVariantData[];
	productId: string;
	id: string;
	image: string | null;
	originalBarcode: string;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
	isOpen,
	onClose,
	productId,
	onSuccess,
}) => {
	const isEditMode = Boolean(productId);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [masterData, setMasterData] = useState<MasterData | null>(null);
	const [loadedItem, setLoadedItem] = useState<LoadedProductData | null>(null);
	const [formKey, setFormKey] = useState(0);

	const loadMasterData = useCallback(async (): Promise<MasterData> => {
		const [cat, sz, grd, prods] = await Promise.all([
			ProductService.getCategories(),
			ProductService.getSizes(),
			ProductService.getGrades(),
			ProductService.getProducts(),
		]);
		const barcodes = Array.from(
			new Set(
				prods.map((p) => p.barcode?.toUpperCase()).filter(Boolean),
			),
		) as string[];
		return {
			categories: cat,
			sizes: sz,
			grades: grd,
			existingBarcodes: barcodes,
		};
	}, []);

	const loadProduct = useCallback(
		async (urlId: string, allProducts: Product[]): Promise<LoadedProductData | null> => {
			const item = allProducts.find(
				(p) => p.type === "PRODUCT" && (p.productId === urlId || p.id === urlId),
			);

			if (!item) return null;

			const originalBarcode = item.productBarcode?.toUpperCase() || item.barcode?.toUpperCase() || "";
			const barcode = item.productBarcode || item.barcode || "";

			const related = allProducts.filter(
				(p) =>
					p.productId === item.productId ||
					(p.productBarcode && p.productBarcode === item.productBarcode) ||
					p.name === item.name,
			);
			const loadedVariants: PriceVariantData[] = related.map((rp) => ({
				id: rp.id,
				sizeId: rp.sizeId || "",
				gradeId: rp.gradeId || "",
				basePrice: rp.basePrice || 0,
				barcode: rp.barcode !== item.productBarcode ? rp.barcode : "",
			}));
			const variants = Array.from(
				new Map(
					loadedVariants.map((v) => [`${v.sizeId}-${v.gradeId}`, v]),
				).values(),
			);

			return {
				name: item.name || "",
				barcode,
				basePrice: item.basePrice || 0,
				disc: item.disc || 0,
				type: "PRODUCT",
				unit: (item.unit || "PCS") as "PCS" | "KILOGRAM",
				isShow: item.isShow ?? true,
				isNonStock: item.isNonStock ?? false,
				categoryId: item.categoryId || "",
				variants,
				productId: item.productId || urlId,
				id: item.id,
				image: item.image || null,
				originalBarcode,
			};
		},
		[],
	);

	useEffect(() => {
		if (!isOpen) {
			setMasterData(null);
			setLoadedItem(null);
			return;
		}

		let cancelled = false;
		setIsLoadingData(true);

		(async () => {
			try {
				const master = await loadMasterData();
				if (cancelled) return;
				setMasterData(master);

				if (isEditMode && productId) {
					const allProducts = await ProductService.getProducts();
					if (cancelled) return;
					const item = await loadProduct(productId, allProducts);
					if (cancelled) return;

					if (item) {
						setLoadedItem(item);
					} else {
						onClose();
						return;
					}
				}
				setFormKey((k) => k + 1);
			} catch (error) {
				console.error("Failed to load product data", error);
			} finally {
				if (!cancelled) setIsLoadingData(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [isOpen, productId, isEditMode, loadMasterData, loadProduct, onClose]);

	const isDataReady = masterData && (!isEditMode || loadedItem);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-5xl! max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-md">
				{isLoadingData || !isDataReady ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="w-8 h-8 animate-spin text-gray-400" />
					</div>
				) : (
					<ProductFormContent
						key={formKey}
						isEditMode={isEditMode}
						productId={productId || null}
						masterData={masterData!}
						loadedItem={loadedItem}
						onClose={onClose}
						onSuccess={onSuccess}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};

interface ProductFormContentProps {
	isEditMode: boolean;
	productId: string | null;
	masterData: MasterData;
	loadedItem: LoadedProductData | null;
	onClose: () => void;
	onSuccess: () => void;
}

const ProductFormContent: React.FC<ProductFormContentProps> = ({
	isEditMode,
	productId,
	masterData,
	loadedItem,
	onClose,
	onSuccess,
}) => {
	const { categories, sizes, grades, existingBarcodes } = masterData;
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("basic");
	const [barcodeApiError, setBarcodeApiError] = useState("");
	const [imagePreview, setImagePreview] = useState<string | null>(loadedItem?.image || null);
	const [originalBarcode] = useState(loadedItem?.originalBarcode || "");
	const [isAutoBarcode, setIsAutoBarcode] = useState(!isEditMode);
	const [variantsFallback, setVariantsFallback] = useState<PriceVariantData[]>(loadedItem?.variants || []);
	const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
	const [editingVariant, setEditingVariant] = useState<PriceVariantData | null>(null);
	const imageEditor = useImageEditor();

	const handleRemoveImage = () => {
		setImagePreview(null);
		form.setFieldValue("imageFile", null as any);
	};

	const form = useForm({
		defaultValues: loadedItem
			? {
					name: loadedItem.name,
					barcode: loadedItem.barcode,
					basePrice: loadedItem.basePrice,
					disc: loadedItem.disc,
					type: "PRODUCT" as const,
					unit: loadedItem.unit,
					isShow: loadedItem.isShow,
					isNonStock: loadedItem.isNonStock,
					categoryId: loadedItem.categoryId,
					variants: loadedItem.variants,
					imageFile: undefined as File | undefined,
					productId: loadedItem.productId,
					id: loadedItem.id,
			  }
			: {
					name: "",
					barcode: generateRandomBarcode(existingBarcodes),
					basePrice: 0,
					disc: 0,
					type: "PRODUCT" as const,
					unit: "PCS" as const,
					isShow: true,
					isNonStock: false,
					categoryId: "",
					variants: [] as PriceVariantData[],
					imageFile: undefined as File | undefined,
					productId: "",
					id: "",
			  },
		onSubmit: async ({ value }) => {
			let hasErrors = false;
			if (!value.name?.trim()) hasErrors = true;
			if (!value.categoryId) hasErrors = true;
			if (value.variants.length === 0) {
				toast.error("Peringatan", {
					description: "Silakan tambahkan minimal satu varian harga untuk produk fisik.",
				});
				setActiveTab("variants");
				return;
			}

			if (value.barcode) {
				const bc = value.barcode.toUpperCase();
				if (!/^[0-9]{2}$/.test(bc)) {
					hasErrors = true;
				} else if (existingBarcodes.includes(bc) && bc !== originalBarcode) {
					toast.error("Peringatan", {
						description: `Barcode produk tidak boleh sama. Barcode tersebut sudah digunakan.`,
					});
					hasErrors = true;
				}
			}

			if (hasErrors) {
				setActiveTab("basic");
				return;
			}

			setIsLoading(true);
			try {
				const processedVariants = value.variants.map((v) => {
					const size = sizes.find((s) => s.id === v.sizeId);
					const grade = grades.find((g) => g.id === v.gradeId);
					return {
						...v,
						barcode: getVariantBarcode(
							value.barcode || "",
							size?.barcode || "",
							grade?.barcode || "",
						),
					};
				});

				const submitData = {
					...value,
					image: imagePreview,
					variants: processedVariants,
					originalBarcode,
					productId: value.productId || productId,
				};
				if (isEditMode && productId) {
					await ProductService.updateProduct(productId, submitData);
				} else {
					await ProductService.createProduct(submitData);
				}
				onSuccess();
				onClose();
			} catch (error) {
				console.error("Failed to save product", error);
				const errMsg = error instanceof Error ? error.message : "";
				if (errMsg.toLowerCase().includes("duplicate entry")) {
					setBarcodeApiError("Barcode ini sudah digunakan oleh produk lain.");
					setActiveTab("basic");
					toast.error("Barcode Duplikat", {
						description: "Barcode ini sudah digunakan. Silakan pilih barcode yang berbeda.",
					});
				} else {
					console.log(errMsg)
					toast.error("Gagal Menyimpan", { description: errMsg || "Terjadi kesalahan saat menyimpan produk." });
				}
			} finally {
				setIsLoading(false);
			}
		},
	});

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) imageEditor.openEditor(file);
		e.target.value = "";
	};

	const handleCropConfirm = async () => {
		const result = await imageEditor.confirmCrop();
		if (result) {
			setImagePreview(result.previewUrl);
			form.setFieldValue("imageFile", result.file);
		}
	};

	const handleAutoBarcodeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		const checked = e.target.checked;
		setIsAutoBarcode(checked);
		setBarcodeApiError("");
		if (checked) form.setFieldValue("barcode", generateRandomBarcode(existingBarcodes));
	};

	const handleSaveVariant = (variant: PriceVariantData) => {
		if (editingVariant?.id) {
			const updated = form.state.values.variants.map((v) => (v.id === variant.id ? variant : v));
			form.setFieldValue("variants", updated);
			setVariantsFallback(updated);
		} else {
			const updated = [...form.state.values.variants, variant];
			form.setFieldValue("variants", updated);
			setVariantsFallback(updated);
		}
	};

	const handleDeleteVariant = (id: string) => {
		const updated = form.state.values.variants.filter((v) => v.id !== id);
		form.setFieldValue("variants", updated as any);
		setVariantsFallback(updated);
	};

	return (
		<>
			<DialogHeader className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
				<DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
					<Package className="w-5 h-5 text-brand-primary" />
					{isEditMode ? "Edit Produk" : "Tambah Produk Baru"}
				</DialogTitle>
				<DialogDescription>
					{isEditMode ? "Ubah detail produk dan harga varian." : "Masukkan detail produk fisik baru."}
				</DialogDescription>
			</DialogHeader>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="flex flex-col overflow-hidden h-full"
			>
				<Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
					<div className="px-6 py-3 border-b border-gray-100 bg-white shadow-sm shrink-0 z-10">
						<TabsList className="grid w-full grid-cols-3 h-11 bg-gray-100/80 p-1">
							<TabsTrigger value="basic" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
								Informasi Dasar
							</TabsTrigger>
							<TabsTrigger value="variants" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
								Varian & Harga
							</TabsTrigger>
							<TabsTrigger value="settings" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
								Pengaturan
							</TabsTrigger>
						</TabsList>
					</div>

					<ScrollArea className="flex-1 w-full bg-slate-50/30">
						<div className="p-6">
							<div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
								{/* Left Column: Tabs Content */}
								<div className="min-w-0">
									<TabsContent value="basic" className="m-0 space-y-6 animate-in fade-in duration-300">
										<BasicInfoTab
											form={form as any}
											isAutoBarcode={isAutoBarcode}
											handleAutoBarcodeToggle={handleAutoBarcodeToggle}
											categories={categories}
											existingBarcodes={existingBarcodes}
											originalBarcode={originalBarcode}
											barcodeApiError={barcodeApiError}
											onBarcodeClearApiError={() => setBarcodeApiError("")}
										/>
									</TabsContent>

									<TabsContent value="variants" className="m-0 space-y-6 animate-in fade-in duration-300">
										<VariantsTab
											form={form as any}
											sizes={sizes}
											grades={grades}
											getVariantBarcode={getVariantBarcode}
											setEditingVariant={setEditingVariant}
											setIsVariantModalOpen={setIsVariantModalOpen}
											handleDeleteVariant={handleDeleteVariant}
										/>
									</TabsContent>

									<TabsContent value="settings" className="m-0 space-y-6 animate-in fade-in duration-300">
										<SettingsTab form={form as any} handleImageChange={handleImageChange} imagePreview={imagePreview} />
									</TabsContent>
								</div>

								{/* Right Column: Image Editor (Persistent) */}
								<div className="space-y-4 lg:pl-6 lg:border-l lg:border-gray-100">
									<Label className="text-sm font-semibold text-gray-700 block">Thumbnail Katalog POS (Optional)</Label>
									<div className="flex flex-col items-center gap-6 p-6 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200">
										<div className="relative group">
											<div className="w-32 h-32 rounded-2xl overflow-hidden bg-white border-2 border-white shadow-lg ring-1 ring-gray-100 relative">
												{imagePreview ? (
													<img src={imagePreview} alt="Preview" className="w-full h-full object-cover animate-in fade-in zoom-in duration-300" />
												) : (
													<div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300">
														<Pencil className="w-10 h-10 mb-1 opacity-20" />
														<span className="text-[10px] font-medium uppercase tracking-wider">No Image</span>
													</div>
												)}
												{/* Overlay on hover */}
												<div 
													className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
													onClick={() => document.getElementById("product-image-upload")?.click()}
												>
													<Pencil className="w-8 h-8 text-white" />
												</div>
											</div>
											{imagePreview && (
												<button
													type="button"
													onClick={handleRemoveImage}
													className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors border-2 border-white"
													title="Hapus gambar"
												>
													<X className="w-4 h-4" />
												</button>
											)}
										</div>

										<div className="text-center space-y-3 w-full">
											<div className="relative">
												<input
													type="file"
													id="product-image-upload"
													accept="image/*"
													className="hidden"
													onChange={handleImageChange}
												/>
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="w-full h-9 px-4 rounded-xl border-gray-200 bg-white text-gray-700 font-semibold text-xs shadow-sm hover:bg-gray-50 hover:border-brand-primary"
													onClick={() => document.getElementById("product-image-upload")?.click()}
												>
													<Pencil className="w-3.5 h-3.5 mr-2 text-brand-primary" />
													{imagePreview ? "Ganti Foto" : "Pilih Foto"}
												</Button>
											</div>
											<p className="text-[10px] text-gray-400 font-medium leading-tight">Recomendasi 1:1, Maks 2MB (.jpg, .png)</p>
										</div>
									</div>

									<div className="p-3.5 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
										<p className="text-[10px] text-brand-primary font-medium leading-relaxed">
											Foto ini akan muncul di aplikasi kasir sebagai alat bantu visual pelabelan produk.
										</p>
									</div>
								</div>
							</div>
						</div>
					</ScrollArea>
				</Tabs>

				<DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
					<div className="flex gap-3 justify-end w-full">
						<Button type="button" variant="outline" className="h-10 px-6 bg-white shadow-xs" onClick={onClose} disabled={isLoading}>
							Batalkan
						</Button>
						<form.Subscribe
							selector={(state) => [state.isSubmitting] as const}
							children={([isSubmitting]) => (
								<Button type="submit" disabled={isSubmitting || isLoading} className="h-10 px-6 gap-2 shadow-md shadow-brand-primary/20">
									<Save className="w-4 h-4" />
									{isSubmitting || isLoading ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Produk"}
								</Button>
							)}
						/>
					</div>
				</DialogFooter>
			</form>

			<PriceVariantModal
				isOpen={isVariantModalOpen}
				onClose={() => setIsVariantModalOpen(false)}
				onSave={handleSaveVariant}
				sizes={sizes}
				grades={grades}
				initialData={editingVariant}
				existingVariants={variantsFallback}
			/>

			<ImageCropModal
				isOpen={imageEditor.isModalOpen}
				imageSrc={imageEditor.imageSrc}
				crop={imageEditor.crop}
				zoom={imageEditor.zoom}
				onCropChange={imageEditor.setCrop}
				onZoomChange={imageEditor.setZoom}
				onCropComplete={imageEditor.handleCropComplete}
				onConfirm={handleCropConfirm}
				onCancel={imageEditor.closeEditor}
			/>
		</>
	);
};

function generateRandomBarcode(usedBarcodes: string[]): string {
	const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	let newBarcode = "";
	let attempts = 0;
	do {
		const n1 = numbers[Math.floor(Math.random() * numbers.length)];
		const n2 = numbers[Math.floor(Math.random() * numbers.length)];
		newBarcode = `${n1}${n2}`;
		attempts++;
	} while (usedBarcodes.includes(newBarcode) && attempts < 100);
	return newBarcode;
}

function getVariantBarcode(parentBarcode: string, sizeBarcode: string, gradeBarcode: string): string {
	if (!parentBarcode) return "";
	return `${parentBarcode.toUpperCase()}${sizeBarcode || "00"}${gradeBarcode || "00"}`;
}
