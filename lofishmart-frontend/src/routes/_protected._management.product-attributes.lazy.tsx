import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ProductService } from "@/services/product.service";
import type { MasterCategory, MasterSize, MasterGrade } from "@/services/product.service";
import { MasterDataCard } from "@/components/ui/MasterDataCard";
import { MasterDataModal } from "@/components/ui/modals/MasterDataModal";
import { Layers, Ruler, Award } from "lucide-react";

export const Route = createLazyFileRoute("/_protected/_management/product-attributes")({
    component: ProductAttributes,
});

type EntityType = "category" | "grade" | "size" | null;

function ProductAttributes() {

    const [categories, setCategories] = useState<MasterCategory[]>([]);
    const [grades, setGrades] = useState<MasterGrade[]>([]);
    const [sizes, setSizes] = useState<MasterSize[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<EntityType>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [cat, grd, sz] = await Promise.all([
                ProductService.getCategories(),
                ProductService.getGrades(),
                ProductService.getSizes(),
            ]);
            setCategories(cat);
            setGrades(grd);
            setSizes(sz);
        } catch (error) {
            console.error("Failed to load master data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ── CRUD Handlers ────────────────────────────────────────────────────

    const handleCreateCategory = async (name: string, barcode: string) => {
        await ProductService.createCategory(name, barcode);
        const updated = await ProductService.getCategories();
        setCategories(updated);
    };
    const handleUpdateCategory = async (id: string, name: string, barcode: string) => {
        await ProductService.updateCategory(id, name, barcode);
        const updated = await ProductService.getCategories();
        setCategories(updated);
    };
    const handleDeleteCategory = async (id: string) => {
        await ProductService.deleteCategory(id);
        const updated = await ProductService.getCategories();
        setCategories(updated);
    };

    const handleCreateGrade = async (name: string, barcode: string) => {
        await ProductService.createGrade(name, barcode);
        const updated = await ProductService.getGrades();
        setGrades(updated);
    };
    const handleUpdateGrade = async (id: string, name: string, barcode: string) => {
        await ProductService.updateGrade(id, name, barcode);
        const updated = await ProductService.getGrades();
        setGrades(updated);
    };
    const handleDeleteGrade = async (id: string) => {
        await ProductService.deleteGrade(id);
        const updated = await ProductService.getGrades();
        setGrades(updated);
    };

    const handleCreateSize = async (name: string, barcode: string) => {
        await ProductService.createSize(name, barcode);
        const updated = await ProductService.getSizes();
        setSizes(updated);
    };
    const handleUpdateSize = async (id: string, name: string, barcode: string) => {
        await ProductService.updateSize(id, name, barcode);
        const updated = await ProductService.getSizes();
        setSizes(updated);
    };
    const handleDeleteSize = async (id: string) => {
        await ProductService.deleteSize(id);
        const updated = await ProductService.getSizes();
        setSizes(updated);
    };

    return (
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50/50">
            <AppHeader title="Atribut Produk" />

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                <p className="text-sm text-gray-500 mb-6">
                    Kelola atribut yang digunakan untuk mengklasifikasikan produk: kategori, grade kualitas, dan ukuran.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <MasterDataCard
                        title="Kategori"
                        description="Kelompokkan produk berdasarkan jenis, seperti Ikan, Udang, Kepiting."
                        icon={Layers}
                        iconColor="bg-blue-100 text-blue-600"
                        itemCount={categories.length}
                        isLoading={isLoading}
                        onManage={() => setActiveModal("category")}
                    />
                    <MasterDataCard
                        title="Grade"
                        description="Tingkatan kualitas produk, seperti Grade A, Grade B, Grade C."
                        icon={Award}
                        iconColor="bg-amber-100 text-amber-600"
                        itemCount={grades.length}
                        isLoading={isLoading}
                        onManage={() => setActiveModal("grade")}
                    />
                    <MasterDataCard
                        title="Ukuran"
                        description="Variasi ukuran produk, seperti Kecil, Sedang, Besar."
                        icon={Ruler}
                        iconColor="bg-emerald-100 text-emerald-600"
                        itemCount={sizes.length}
                        isLoading={isLoading}
                        onManage={() => setActiveModal("size")}
                    />
                </div>
            </div>

            {/* Modals */}
            <MasterDataModal
                isOpen={activeModal === "category"}
                onClose={() => setActiveModal(null)}
                title="Kategori"
                description="Tambah, edit, atau hapus kategori produk."
                icon={Layers}
                iconColor="bg-blue-100 text-blue-600"
                items={categories}
                isLoading={isLoading}
                onCreate={handleCreateCategory}
                onUpdate={handleUpdateCategory}
                onDelete={handleDeleteCategory}
            />
            <MasterDataModal
                isOpen={activeModal === "grade"}
                onClose={() => setActiveModal(null)}
                title="Grade"
                description="Tambah, edit, atau hapus grade kualitas produk."
                icon={Award}
                iconColor="bg-amber-100 text-amber-600"
                items={grades}
                isLoading={isLoading}
                onCreate={handleCreateGrade}
                onUpdate={handleUpdateGrade}
                onDelete={handleDeleteGrade}
            />
            <MasterDataModal
                isOpen={activeModal === "size"}
                onClose={() => setActiveModal(null)}
                title="Ukuran"
                description="Tambah, edit, atau hapus ukuran produk."
                icon={Ruler}
                iconColor="bg-emerald-100 text-emerald-600"
                items={sizes}
                isLoading={isLoading}
                onCreate={handleCreateSize}
                onUpdate={handleUpdateSize}
                onDelete={handleDeleteSize}
            />
        </main>
    );
}
