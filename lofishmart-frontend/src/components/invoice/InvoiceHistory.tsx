import { useState } from "react";
import { FileText, Printer, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceModal } from "./InvoiceModal";
import { PrintService } from "@/lib/print";
import { InvoiceStore } from "@/lib/invoiceStore";
import { formatInvoiceDate, formatInvoiceCurrency } from "@/lib/invoice";
import type { Invoice, SalesInvoice, PurchaseInvoice } from "@/types/invoice";

interface InvoiceHistoryProps {
	invoices: Invoice[];
	onDelete?: (id: string) => void;
	onRefresh?: () => void;
}

export function InvoiceHistory({ invoices, onDelete, onRefresh }: InvoiceHistoryProps) {
	const [search, setSearch] = useState("");
	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

	const filtered = invoices.filter((inv) => {
		const q = search.toLowerCase();
		return (
			inv.invoiceNumber.toLowerCase().includes(q) ||
			(inv.type === "SALES" && (inv as SalesInvoice).customerName.toLowerCase().includes(q)) ||
			(inv.type === "PURCHASE" && (inv as PurchaseInvoice).supplierName.toLowerCase().includes(q))
		);
	});

	const handlePrint = (inv: Invoice) => {
		PrintService.printInvoice(inv);
	};

	const handleDelete = (id: string) => {
		InvoiceStore.delete(id);
		onDelete?.(id);
		onRefresh?.();
		if (selectedInvoice?.id === id) setSelectedInvoice(null);
	};

	return (
		<div>
			<div className="relative mb-4">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
				<input
					type="text"
					placeholder="Cari invoice..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
				/>
			</div>

			{filtered.length === 0 ? (
				<div className="text-center py-8 text-gray-400">
					<FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
					<p className="text-sm">Belum ada invoice</p>
				</div>
			) : (
				<div className="space-y-2">
					{filtered.map((inv) => {
						const isSales = inv.type === "SALES";
						const name = isSales
							? (inv as SalesInvoice).customerName
							: (inv as PurchaseInvoice).supplierName;

						return (
							<div
								key={inv.id}
								className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors cursor-pointer"
								onClick={() => setSelectedInvoice(inv)}
							>
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
										<FileText className="w-4 h-4 text-brand-primary" />
									</div>
									<div className="min-w-0">
										<p className="text-sm font-medium truncate">
											{inv.invoiceNumber}
										</p>
										<p className="text-xs text-gray-500 truncate">
											{name} &middot; {formatInvoiceDate(inv.date)}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									<span className="text-sm font-semibold">
										{formatInvoiceCurrency(inv.total)}
									</span>
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={(e) => {
											e.stopPropagation();
											handlePrint(inv);
										}}
									>
										<Printer className="w-4 h-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={(e) => {
											e.stopPropagation();
											handleDelete(inv.id);
										}}
										className="text-red-400 hover:text-red-600"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			<InvoiceModal
				invoice={selectedInvoice}
				open={!!selectedInvoice}
				onClose={() => setSelectedInvoice(null)}
				onDelete={handleDelete}
			/>
		</div>
	);
}
