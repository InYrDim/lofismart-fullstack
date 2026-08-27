import { useEffect, useMemo, useState } from "react";
import { useCatalogFormModal } from "@/hooks/useCatalogFormModal";
import { createLazyFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";

export const Route = createLazyFileRoute("/_protected/_management/products")({
	component: ProductList,
});
import { ProductService } from "@/services/product.service";
import type { Product } from "@/types";
import { ProductFormModal } from "@/components/ui/modals/ProductFormModal";
import { ServiceFormModal } from "@/components/ui/modals/ServiceFormModal";
import { Modal } from "@/components/ui/modals/Modal";
import {
	RefreshCw,
	Edit,
	Trash2,
	Search,
	Package,
	Sparkles,
	Archive,
	ArchiveRestore,
	Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ProductImage } from "@/components/ui/ProductImage";
import { toast } from "sonner";

type ArchiveFilter = "ALL" | "ACTIVE" | "ARCHIVED";

function ProductList() {
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>("ALL");

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [productToDelete, setProductToDelete] = useState<{
		id: string;
		type: "PRODUCT" | "SERVICE";
		productId?: string;
		name: string;
	} | null>(null);

	const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
	const [productToArchive, setProductToArchive] = useState<{
		id: string;
		type: "PRODUCT" | "SERVICE";
		name: string;
		isShow: boolean;
	} | null>(null);
	const [isArchiving, setIsArchiving] = useState(false);

	useEffect(() => {
		fetchProducts();
	}, []);

	const catalogModal = useCatalogFormModal({ onSuccess: fetchProducts });

	async function fetchProducts() {
		setIsLoading(true);
		try {
			const data = await ProductService.getBaseProducts();
			setProducts(data);
		} catch (error) {
			console.error("Failed to load products", error);
		} finally {
			setIsLoading(false);
		}
	}

	const confirmDelete = async () => {
		if (!productToDelete) return;

		try {
			await ProductService.deleteProduct(
				productToDelete.id,
				productToDelete.type,
			);
			setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
			setIsDeleteModalOpen(false);
			setProductToDelete(null);
		} catch (error) {
		        console.error("Failed to delete product", error);
		        toast.error("Gagal menghapus produk. Pastikan Anda memiliki izin akses.");
		}
		};

		const confirmArchive = async () => {
		if (!productToArchive) return;
		setIsArchiving(true);
		try {
		        await ProductService.toggleArchive(
		                productToArchive.id,
		                productToArchive.type,
		                productToArchive.isShow,
		        );
		        // Update local state
		        setProducts((prev) =>
		                prev.map((p) =>
		                        p.id === productToArchive.id
		                                ? { ...p, isShow: !productToArchive.isShow }
		                                : p,
		                ),
		        );
		        setIsArchiveModalOpen(false);
		        setProductToArchive(null);
		} catch (error) {
		        console.error("Failed to toggle archive", error);
		        toast.error("Gagal mengubah status arsip produk.");
		} finally {
		        setIsArchiving(false);
		}
		};
	const filteredProducts = useMemo(() => {
		return products.filter((p) => {
			const matchesSearch =
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.barcode.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesArchive =
				archiveFilter === "ALL"
					? true
					: archiveFilter === "ACTIVE"
						? p.isShow !== false
						: p.isShow === false;

			return matchesSearch && matchesArchive;
		});
	}, [products, searchQuery, archiveFilter]);

	const stats = useMemo(() => {
		return {
			totalProducts: products.filter((p) => p.type === "PRODUCT").length,
			totalServices: products.filter((p) => p.type === "SERVICE").length,
			totalArchived: products.filter((p) => p.isShow === false).length,
		};
	}, [products]);

	function renderProductLoading() {
		return (
			<tr>
				<td colSpan={7} className="py-8 text-center text-gray-500">
					Memuat data produk...
				</td>
			</tr>
		);
	}

	function renderProductEmpty() {
		return (
			<tr>
				<td colSpan={7} className="py-8 text-center text-gray-500">
					Tidak ada produk yang ditemukan.
				</td>
			</tr>
		);
	}

	function renderActualProduct(product: Product) {
		console.log(import.meta.env.VITE_API_BASE_URL);

		const isArchived = product.isShow === false;

		function renderProductStatusBadge() {
			return isArchived ? (
				<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
					<Archive className="w-3 h-3" />
					Diarsipkan
				</span>
			) : (
				<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
					Aktif
				</span>
			);
		}

		function renderProductActionButtons() {
			const buttonActions = [
				{
					icon: <Edit className="w-4 h-4" />,
					title: "Edit",
					onClick: () => catalogModal.openForEdit(product),
				},
				{
					icon: isArchived ? (
						<ArchiveRestore className="w-4 h-4 text-emerald-600" />
					) : (
						<Archive className="w-4 h-4 text-amber-600" />
					),
					title: isArchived ? "Pulihkan" : "Arsipkan",
					onClick: () => {
						setProductToArchive({
							id: product.id,
							type: product.type,
							name: product.name,
							isShow: product.isShow !== false,
						});
						setIsArchiveModalOpen(true);
					},
				},
				{
					icon: <Trash2 className="w-4 h-4" />,
					title: "Hapus Produk",
					onClick: () => {
						setProductToDelete({
							id: product.id,
							type: product.type,
							productId: product.productId,
							name: product.name,
						});
						setIsDeleteModalOpen(true);
					},
				},
			];

			function ActionButton({
				children,
				...props
			}: {
				children: React.ReactNode;
				onClick: () => void;
				title: string;
			}) {
				return (
					<Button variant={"outline"} {...props}>
						{children}
					</Button>
				);
			}

			return (
				<div className="flex justify-end gap-2">
					{buttonActions.map((action, index) => (
						<ActionButton
							key={index}
							onClick={action.onClick}
							title={action.title}
						>
							{action.icon}
						</ActionButton>
					))}
				</div>
			);
		}

		return (
			<tr
				key={product.id}
				className={`hover:bg-gray-50/50 ${isArchived ? "opacity-60" : ""}`}
			>
				<td className="py-3 px-4">
					<ProductImage
						src={product.image}
						alt={product.name}
						size="xs"
						rounded="sm"
						containerClassName="shrink-0"
					/>
				</td>
				<td className="py-3 px-4 text-gray-600">{product.barcode}</td>
				<td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
				<td className="py-3 px-4">
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						{product.category || product.type}
					</span>
				</td>

				<td className="py-3 px-4">{renderProductStatusBadge()}</td>

				<td className="py-3 px-4 text-right text-gray-900 font-medium">
					{product.type === "SERVICE" ? (
						`Rp ${product.basePrice.toLocaleString("id-ID")}`
					) : (
						<span className="text-gray-400 italic text-sm font-normal">
							Sesuai Varian
						</span>
					)}
				</td>
				<td className="py-3 px-4 text-right">{renderProductActionButtons()}</td>
			</tr>
		);
	}

	function renderTabelBody() {
		if (isLoading) return renderProductLoading();

		if (filteredProducts.length === 0) return renderProductEmpty();

		return (
			<>{filteredProducts.map((product) => renderActualProduct(product))}</>
		);
	}

	function renderCatalogItems() {
		return (
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="bg-gray-50 border-b border-gray-100">
						<th className="py-3 px-4 font-semibold text-gray-600">Gambar</th>
						<th className="py-3 px-4 font-semibold text-gray-600">Barcode</th>
						<th className="py-3 px-4 font-semibold text-gray-600">
							Nama Produk
						</th>
						<th className="py-3 px-4 font-semibold text-gray-600">Kategori</th>
						<th className="py-3 px-4 font-semibold text-gray-600">Status</th>
						<th className="py-3 px-4 font-semibold text-gray-600 text-right">
							Harga Base
						</th>
						<th className="py-3 px-4 font-semibold text-gray-600 text-right">
							Aksi
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100">{renderTabelBody()}</tbody>
			</table>
		);
	}

	function renderStatsSection() {
		const cards = [
			{
				label: "Total Produk",
				value: stats.totalProducts,
				icon: Package,
				color: "text-blue-600",
				bg: "bg-blue-50",
			},
			{
				label: "Total Jasa",
				value: stats.totalServices,
				icon: Sparkles,
				color: "text-purple-600",
				bg: "bg-purple-50",
			},
			{
				label: "Diarsipkan",
				value: stats.totalArchived,
				icon: Archive,
				color: "text-amber-600",
				bg: "bg-amber-50",
			},
		];

		return (
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{cards.map((card, i) => (
					<div
						key={i}
						className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center gap-4"
					>
						<div
							className={`w-12 h-12 ${card.bg} ${card.color} rounded-lg flex items-center justify-center`}
						>
							<card.icon className="w-6 h-6" />
						</div>
						<div>
							<p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
								{card.label}
							</p>
							<p className="text-2xl font-bold text-gray-900">{card.value}</p>
						</div>
					</div>
				))}
			</div>
		);
	}

	function renderProductListBody() {
		return (
			<main className="flex-1 overflow-auto p-6">
				<div className="max-w-7xl mx-auto space-y-6">
					{renderStatsSection()}

					<div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-xs border border-gray-100">
						<div className="relative w-full sm:w-96">
							<Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
							<Input
								placeholder="Cari nama atau barcode produk..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 h-10"
							/>
						</div>
						<div className="flex items-center gap-3 w-full sm:w-auto">
							<Select
								value={archiveFilter}
								onChange={(val) => setArchiveFilter(val as ArchiveFilter)}
								options={[
									{ value: "ALL", label: `Semua` },
									{
										value: "ACTIVE",
										label: "Aktif",
									},
									{
										value: "ARCHIVED",
										label: "Diarsipkan",
									},
								]}
								placeholder="Filter Status"
								className="h-10"
							/>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
						<div className="overflow-x-auto">{renderCatalogItems()}</div>
					</div>
				</div>
			</main>
		);
	}

	function renderProductListModalDelete() {
		return (
			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Hapus Produk"
				description={`Apakah Anda yakin ingin menghapus produk "${productToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
				variant="error"
				size="sm"
			>
				<div className="flex justify-end gap-3 w-full mt-6">
					<Button
						variant="outline-primary"
						onClick={() => setIsDeleteModalOpen(false)}
					>
						Batal
					</Button>
					<Button
						className="bg-red-600 hover:bg-red-700 text-white border-0"
						onClick={confirmDelete}
					>
						Hapus
					</Button>
				</div>
			</Modal>
		);
	}

	function renderArchiveModal() {
		const isCurrentlyActive = productToArchive?.isShow === true;
		return (
			<Modal
				isOpen={isArchiveModalOpen}
				onClose={() => setIsArchiveModalOpen(false)}
				title={isCurrentlyActive ? "Arsipkan Produk" : "Pulihkan Produk"}
				description={
					isCurrentlyActive
						? `Produk "${productToArchive?.name}" akan diarsipkan dan tidak akan tampil di halaman POS. Anda masih bisa memulihkannya kapan saja.`
						: `Produk "${productToArchive?.name}" akan dipulihkan dan akan tampil kembali di halaman POS.`
				}
				variant={isCurrentlyActive ? "warning" : "success"}
				size="sm"
			>
				<div className="flex justify-end gap-3 w-full mt-6">
					<Button
						variant="outline-primary"
						onClick={() => setIsArchiveModalOpen(false)}
					>
						Batal
					</Button>
					<Button
						className={
							isCurrentlyActive
								? "bg-amber-600 hover:bg-amber-700 text-white border-0"
								: "bg-emerald-600 hover:bg-emerald-700 text-white border-0"
						}
						onClick={confirmArchive}
						disabled={isArchiving}
					>
						{isArchiving
							? "Memproses..."
							: isCurrentlyActive
								? "Arsipkan"
								: "Pulihkan"}
					</Button>
				</div>
			</Modal>
		);
	}

	return (
		<div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
			<AppHeader title="Manajemen Produk">
				<Button
					onClick={() => fetchProducts()}
					variant="outline"
					size="sm"
					className="gap-2"
					disabled={isLoading}
				>
					<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
					Refresh
				</Button>
				<Button
					onClick={() => catalogModal.openForAddService()}
					variant="outline"
					size="sm"
					className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
				>
					<Sparkles className="w-4 h-4" /> Tambah Layanan
				</Button>
				<Button
					onClick={() => catalogModal.openForAddProduct()}
					size="sm"
					className="gap-2"
				>
					<Plus className="w-4 h-4" /> Tambah Produk
				</Button>
			</AppHeader>
			{renderProductListBody()}

			<ProductFormModal
				isOpen={catalogModal.isOpen && catalogModal.initialType === "PRODUCT"}
				onClose={catalogModal.close}
				productId={catalogModal.selectedId}
				onSuccess={catalogModal.modalProps.onSuccess}
			/>

			<ServiceFormModal
				isOpen={catalogModal.isOpen && catalogModal.initialType === "SERVICE"}
				onClose={catalogModal.close}
				productId={catalogModal.selectedId}
				onSuccess={catalogModal.modalProps.onSuccess}
			/>

			{renderProductListModalDelete()}
			{renderArchiveModal()}
		</div>
	);
}
