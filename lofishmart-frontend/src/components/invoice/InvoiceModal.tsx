import { useEffect } from "react";
import { X, Printer, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoicePreview } from "./InvoicePrintTemplate";
import { PrintService } from "@/lib/print";
import type { Invoice } from "@/types/invoice";

interface InvoiceModalProps {
	invoice: Invoice | null;
	open: boolean;
	onClose: () => void;
	onDelete?: (id: string) => void;
}

export function InvoiceModal({ invoice, open, onClose, onDelete }: InvoiceModalProps) {
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (open) document.addEventListener("keydown", handleEsc);
		return () => document.removeEventListener("keydown", handleEsc);
	}, [open, onClose]);

	if (!open || !invoice) return null;

	const handlePrint = () => {
		PrintService.printInvoice(invoice);
	};

	const handleSave = () => {
		const invoices = JSON.parse(localStorage.getItem("lofish_invoices") || "[]");
		const idx = invoices.findIndex((i: Invoice) => i.id === invoice.id);
		if (idx >= 0) {
			invoices[idx] = invoice;
		} else {
			invoices.push(invoice);
		}
		localStorage.setItem("lofish_invoices", JSON.stringify(invoices));
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col mx-4">
				<div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
					<div>
						<h2 className="text-lg font-bold">
							{invoice.type === "SALES" ? "Faktur Penjualan" : "Faktur Pembelian"}
						</h2>
						<p className="text-sm text-gray-500 font-mono">{invoice.invoiceNumber}</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={handleSave}>
							<Download className="w-4 h-4 mr-1" />
							Simpan
						</Button>
						<Button variant="outline" size="sm" onClick={handlePrint}>
							<Printer className="w-4 h-4 mr-1" />
							Cetak
						</Button>
						{onDelete && (
							<Button variant="ghost" size="sm" onClick={() => onDelete(invoice.id)} className="text-red-500">
								<Trash2 className="w-4 h-4" />
							</Button>
						)}
						<Button variant="ghost" size="icon-sm" onClick={onClose}>
							<X className="w-5 h-5" />
						</Button>
					</div>
				</div>
				<div className="overflow-y-auto flex-1 p-6">
					<InvoicePreview invoice={invoice} />
				</div>
			</div>
		</div>
	);
}
