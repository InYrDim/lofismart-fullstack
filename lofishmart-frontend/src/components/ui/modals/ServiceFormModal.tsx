/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { ProductService, type MasterCategory } from "@/services/product.service";
import { Save, Pencil, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { ImageCropModal } from "./ImageCropModal";
import { useImageEditor } from "@/hooks/useImageEditor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { X } from "lucide-react";
import type { Product } from "@/types";

interface ServiceFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	productId?: string | null;
	onSuccess: () => void;
}

interface MasterData {
	categories: MasterCategory[];
	existingBarcodes: string[];
}

interface LoadedServiceData {
	name: string;
	barcode: string;
	basePrice: number;
	disc: number;
	type: "SERVICE";
	unit: "PCS";
	isShow: boolean;
	isNonStock: boolean;
	categoryId: string;
	productId: string;
	id: string;
	image: string | null;
	originalBarcode: string;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
	isOpen,
	onClose,
	productId,
	onSuccess,
}) => {
	const isEditMode = Boolean(productId);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [masterData, setMasterData] = useState<MasterData | null>(null);
	const [loadedItem, setLoadedItem] = useState<LoadedServiceData | null>(null);
	const [formKey, setFormKey] = useState(0);

	const loadMasterData = useCallback(async (): Promise<MasterData> => {
		const [cat, prods] = await Promise.all([
			ProductService.getCategories(),
			ProductService.getProducts(),
		]);
		const barcodes = Array.from(
			new Set(
				prods.map((p) => p.barcode?.toUpperCase()).filter(Boolean),
			),
		) as string[];
		return {
			categories: cat,
			existingBarcodes: barcodes,
		};
	}, []);

	const loadService = useCallback(
		async (urlId: string, allProducts: Product[]): Promise<LoadedServiceData | null> => {
			const item = allProducts.find(
				(p: any) => p.type === "SERVICE" && (p.id === urlId || p.productId === urlId),
			);
			if (!item) return null;

			return {
				name: item.name || "",
				barcode: item.barcode || "",
				basePrice: item.basePrice || 0,
				disc: item.disc || 0,
				type: "SERVICE",
				unit: "PCS",
				isShow: item.isShow ?? true,
				isNonStock: true,
				categoryId: item.categoryId || "",
				productId: item.productId || urlId,
				id: item.id,
				image: item.image || null,
				originalBarcode: item.barcode?.toUpperCase() || "",
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
					const item = await loadService(productId, allProducts);
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
				console.error("Failed to load service data", error);
			} finally {
				if (!cancelled) setIsLoadingData(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [isOpen, productId, isEditMode, loadMasterData, loadService, onClose]);

	const isDataReady = masterData && (!isEditMode || loadedItem);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-3xl! max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-md">
				{isLoadingData || !isDataReady ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="w-8 h-8 animate-spin text-gray-400" />
					</div>
				) : (
					<ServiceFormContent
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

interface ServiceFormContentProps {
	isEditMode: boolean;
	productId: string | null;
	masterData: MasterData;
	loadedItem: LoadedServiceData | null;
	onClose: () => void;
	onSuccess: () => void;
}

const ServiceFormContent: React.FC<ServiceFormContentProps> = ({
	isEditMode,
	productId,
	masterData,
	loadedItem,
	onClose,
	onSuccess,
}) => {
	const { categories, existingBarcodes } = masterData;
	const [isLoading, setIsLoading] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(loadedItem?.image || null);
	const imageEditor = useImageEditor();
	const form = useForm({
		defaultValues: loadedItem
			? {
					name: loadedItem.name,
					barcode: loadedItem.barcode,
					basePrice: loadedItem.basePrice,
					disc: loadedItem.disc,
					categoryId: loadedItem.categoryId,
					isShow: loadedItem.isShow,
					imageFile: undefined as File | undefined,
			  }
			: {
					name: "",
					barcode: generateRandomBarcode(existingBarcodes),
					basePrice: 0,
					disc: 0,
					categoryId: "",
					isShow: true,
					imageFile: undefined as File | undefined,
			  },
		onSubmit: async ({ value }) => {
			if (!value.name?.trim()) return;

			setIsLoading(true);
			try {
				const submitData = {
					...value,
					image: imagePreview,
					type: "SERVICE" as const,
					unit: "PCS" as const,
					isNonStock: true,
					productId: productId || "",
				};
				if (isEditMode && productId) {
					await ProductService.updateProduct(productId, submitData as any);
				} else {
					await ProductService.createProduct(submitData as any);
				}
				onSuccess();
				onClose();
			} catch (error) {
				console.error("Failed to save service", error);
				toast.error("Gagal Menyimpan", { description: "Terjadi kesalahan saat menyimpan layanan." });
			} finally {
				setIsLoading(false);
			}
		},
	});

	const handleRemoveImage = () => {
		setImagePreview(null);
		form.setFieldValue("imageFile", null as any);
	};

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

	return (
		<>
			<DialogHeader className="px-6 py-5 border-b border-gray-100 bg-purple-50/30">
				<DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
					<Sparkles className="w-5 h-5 text-purple-600" />
					{isEditMode ? "Edit Layanan" : "Tambah Layanan Baru"}
				</DialogTitle>
				<DialogDescription>
					Ubah detail layanan atau jasa. Tarif diatur langsung tanpa varian.
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
				<ScrollArea className="flex-1 w-full bg-slate-50/10">
					<div className="p-6 pb-12">
						<div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
							{/* Left Column: Form Fields */}
							<div className="space-y-5">
								<div className="space-y-2">
									<Label htmlFor="service-name">Nama Layanan</Label>
									<form.Field name="name">
										{(field: any) => (
											<Input
												id="service-name"
												placeholder="Contoh: Titip Jual, Voucher, dll"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="h-11"
											/>
										)}
									</form.Field>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="service-category">Kategori</Label>
										<form.Field name="categoryId">
											{(field: any) => (
												<Select
													value={field.state.value}
													onChange={(val) => field.handleChange(val)}
													options={categories.map((c) => ({ value: c.id, label: c.name }))}
													placeholder="Pilih Kategori"
													className="h-11"
												/>
											)}
										</form.Field>
									</div>
									<div className="space-y-2">
										<Label htmlFor="service-barcode">Barcode</Label>
										<form.Field name="barcode">
											{(field: any) => (
												<Input
													id="service-barcode"
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="Barcode"
													className="h-11 font-mono tracking-wider"
												/>
											)}
										</form.Field>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="service-price">Harga (Tarif)</Label>
										<form.Field name="basePrice">
											{(field: any) => (
												<div className="relative">
													<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
													<Input
														id="service-price"
														type="number"
														className="pl-9 h-11"
														value={field.state.value}
														onChange={(e) => field.handleChange(Number(e.target.value) as any)}
													/>
												</div>
											)}
										</form.Field>
									</div>
									<div className="space-y-2">
										<Label htmlFor="service-disc">Diskon (Opsional)</Label>
										<form.Field name="disc">
											{(field: any) => (
												<div className="relative">
													<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
													<Input
														id="service-disc"
														type="number"
														className="pl-9 h-11"
														value={field.state.value}
														onChange={(e) => field.handleChange(Number(e.target.value))}
													/>
												</div>
											)}
										</form.Field>
									</div>
								</div>
							</div>

							{/* Right Column: Image Editor */}
							<div className="space-y-4 lg:pl-6 lg:border-l lg:border-gray-100">
								<Label className="text-sm font-semibold text-gray-700 block">Gambar Representasi Kasir (Opsional)</Label>
								<div className="flex flex-col items-center gap-6 p-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-gray-200">
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
												onClick={() => document.getElementById("service-image-upload")?.click()}
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
												id="service-image-upload"
												accept="image/*"
												className="hidden"
												onChange={handleImageChange}
											/>
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="w-full h-9 px-4 rounded-xl border-gray-200 bg-white text-gray-700 font-semibold text-xs shadow-sm hover:bg-gray-50 hover:border-brand-primary"
												onClick={() => document.getElementById("service-image-upload")?.click()}
											>
												<Pencil className="w-3.5 h-3.5 mr-2 text-purple-500" />
												{imagePreview ? "Ganti Foto" : "Pilih Foto"}
											</Button>
										</div>
										<p className="text-[10px] text-gray-400 font-medium leading-tight">Recomendasi 1:1, Maks 2MB (.jpg, .png)</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</ScrollArea>

				<DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
					<div className="flex gap-3 justify-end w-full">
						<Button type="button" variant="outline" className="h-10 px-6 bg-white shadow-xs" onClick={onClose} disabled={isLoading}>
							Batalkan
						</Button>
						<Button type="submit" disabled={isLoading} className="h-10 px-6 gap-2 shadow-md shadow-purple-500/20 bg-purple-600 hover:bg-purple-700">
							<Save className="w-4 h-4" />
							{isLoading ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Layanan"}
						</Button>
					</div>
				</DialogFooter>
			</form>

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
