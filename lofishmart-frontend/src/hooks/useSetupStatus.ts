import { useState, useEffect } from "react";
import { ProductService } from "@/services/product.service";
import { SupplierService } from "@/services/supplier.service";
import { UserService } from "@/services/user.service";
import { ProfileService } from "@/services/profile.service";
import { ROLES } from "@/config/roles";
import { getRoleId } from "./useRoleAndPermission";

export interface SetupItem {
	label: string;
	ok: boolean;
	link: string;
}

export function useSetupStatus() {
	const [items, setItems] = useState<SetupItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		const check = async () => {
			setIsLoading(true);
			try {
				const [products, services, categories, sizes, grades, markets, suppliers, users] =
					await Promise.all([
						ProductService.getBaseProducts().catch(() => []),
						ProductService.getProducts()
							.then((p) => p.filter((x) => x.type === "SERVICE"))
							.catch(() => []),
						ProductService.getCategories().catch(() => []),
						ProductService.getSizes().catch(() => []),
						ProductService.getGrades().catch(() => []),
						ProfileService.getMarketProfiles().catch(() => []),
						SupplierService.getSuppliers().catch(() => []),
						UserService.getUsers().catch(() => []),
					]);

				// Filter users: any role except admin
				const nonAdminUsers = users.filter((u) => {
					const roleId = getRoleId(u);
					return roleId !== ROLES.ADMIN;
				});

				const hasAttributes = categories.length > 0 && sizes.length > 0 && grades.length > 0;
				// Only show products that are actual products (not services)
				const productOnly = products.filter((p) => p.type === "PRODUCT");

				if (cancelled) return;

				setItems([
					{ label: "Market", ok: markets.length > 0, link: "/management/outlet" },
					{ label: "Produk", ok: productOnly.length > 0, link: "/products" },
					{ label: "Service", ok: services.length > 0, link: "/products" },
					{ label: "Atribut (Kategori/Ukuran/Grade)", ok: hasAttributes, link: "/product-attributes" },
					{ label: "Supplier", ok: suppliers.length > 0, link: "/suppliers" },
					{ label: "User (selain Admin)", ok: nonAdminUsers.length > 0, link: "/users" },
				]);
			} catch (err) {
				console.error("Setup status check failed:", err);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		check();
		return () => {
			cancelled = true;
		};
	}, []);

	const missingItems = items.filter((i) => !i.ok);

	return { items, missingItems, isLoading, allReady: missingItems.length === 0 };
}
