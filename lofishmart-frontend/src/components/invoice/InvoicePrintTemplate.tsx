import type { Invoice, InvoiceItem } from "@/types/invoice";
import { formatInvoiceCurrency, formatInvoiceDateTime } from "@/lib/invoice";

interface InvoicePrintTemplateProps {
	invoice: Invoice;
}

function ItemsTable({ items, label }: { items: InvoiceItem[]; label: string }) {
	if (items.length === 0) {
		return (
			<div>
				<h4 className="text-sm font-semibold text-gray-600 mb-1">{label}</h4>
				<p className="text-sm text-gray-400">&mdash;</p>
			</div>
		);
	}

	return (
		<div>
			<h4 className="text-sm font-semibold text-gray-600 mb-1">{label}</h4>
			<table className="w-full text-sm border-collapse">
				<thead>
					<tr className="bg-gray-50 border-y">
						<th className="text-left py-2 px-3 font-medium">Item</th>
						<th className="text-center py-2 px-3 font-medium">Qty</th>
						<th className="text-right py-2 px-3 font-medium">Harga</th>
						<th className="text-right py-2 px-3 font-medium">Subtotal</th>
					</tr>
				</thead>
				<tbody>
					{items.map((item) => (
						<tr key={item.id} className="border-b border-gray-100">
							<td className="py-2 px-3 font-medium">
								{item.name}
								{item.grade && <span className="text-gray-500 text-xs ml-1">({item.grade})</span>}
								{item.size && <span className="text-gray-500 text-xs ml-1">- {item.size}</span>}
							</td>
							<td className="text-center py-2 px-3">{item.qty} {item.unit}</td>
							<td className="text-right py-2 px-3">{formatInvoiceCurrency(item.price)}</td>
							<td className="text-right py-2 px-3">{formatInvoiceCurrency(item.subtotal)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function InvoicePreview({ invoice }: InvoicePrintTemplateProps) {
	const isSales = invoice.type === "SALES";
	const productItems = invoice.items.filter((i) => i.type !== "SERVICE");
	const serviceItems = invoice.items.filter((i) => i.type === "SERVICE");

	return (
		<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
			<div className="p-6 space-y-4">
				<div className="flex justify-between items-start border-b pb-4">
					<div className="flex gap-3 items-center">
						{invoice.company.logo && (
							<img src={invoice.company.logo} alt="" className="w-12 h-12 object-contain rounded" />
						)}
						<div>
							<h2 className="font-bold text-lg">{invoice.company.name}</h2>
							<p className="text-xs text-gray-500">{invoice.company.address}</p>
						</div>
					</div>
					<div className="text-right">
						<h3 className="font-bold text-base uppercase text-gray-700">
							{isSales ? "Faktur Penjualan" : "Faktur Pembelian"}
						</h3>
						<p className="text-sm font-mono text-gray-500">{invoice.invoiceNumber}</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4 text-sm">
					<div className="space-y-1">
						<p><span className="text-gray-500">Tanggal:</span> <span className="font-medium">{formatInvoiceDateTime(invoice.date)}</span></p>
						{isSales ? (
							<>
								<p><span className="text-gray-500">Market:</span> <span className="font-medium">{invoice.marketName}</span></p>
								<p><span className="text-gray-500">Kasir:</span> <span className="font-medium">{invoice.cashierName}</span></p>
							</>
						) : (
							<>
								<p><span className="text-gray-500">Supplier:</span> <span className="font-medium">{invoice.supplierName}</span></p>
								<p><span className="text-gray-500">Gudang:</span> <span className="font-medium">{invoice.warehouseName}</span></p>
							</>
						)}
					</div>
					<div className="space-y-1">
						{isSales && (
							<>
								<p><span className="text-gray-500">Pelanggan:</span> <span className="font-medium">{invoice.customerName}</span></p>
								<p><span className="text-gray-500">Pembayaran:</span> <span className="font-medium">{invoice.paymentMethod}</span></p>
							</>
						)}
						{!isSales && (
							<p><span className="text-gray-500">User:</span> <span className="font-medium">{invoice.userName}</span></p>
						)}
					</div>
				</div>

				<ItemsTable items={productItems} label="Produk" />
				<ItemsTable items={serviceItems} label="Layanan" />

				<div className="flex justify-end">
					<div className="w-64 space-y-1 text-sm">
						<div className="flex justify-between">
							<span className="text-gray-500">Subtotal</span>
							<span>{formatInvoiceCurrency(invoice.subtotal)}</span>
						</div>
						{isSales && invoice.itemDiscount > 0 && (
							<div className="flex justify-between">
								<span className="text-gray-500">Diskon Item</span>
								<span className="text-red-500">-{formatInvoiceCurrency(invoice.itemDiscount)}</span>
							</div>
						)}
						{isSales && invoice.voucherDiscount > 0 && (
							<div className="flex justify-between">
								<span className="text-gray-500">Diskon Voucher</span>
								<span className="text-red-500">-{formatInvoiceCurrency(invoice.voucherDiscount)}</span>
							</div>
						)}
						{isSales && invoice.tax > 0 && (
							<div className="flex justify-between">
								<span className="text-gray-500">Pajak</span>
								<span>{formatInvoiceCurrency(invoice.tax)}</span>
							</div>
						)}
						<div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
							<span>Total</span>
							<span>{formatInvoiceCurrency(invoice.total)}</span>
						</div>
						{isSales && (
							<>
								<div className="flex justify-between text-gray-500">
									<span>Dibayar</span>
									<span>{formatInvoiceCurrency(invoice.payedMoney)}</span>
								</div>
								<div className="flex justify-between text-gray-500">
									<span>Kembali</span>
									<span>{formatInvoiceCurrency(invoice.changeMoney)}</span>
								</div>
							</>
						)}
					</div>
				</div>

				{invoice.note && (
					<div className="bg-gray-50 p-3 rounded-lg text-sm">
						<span className="font-medium text-gray-700">Catatan:</span> {invoice.note}
					</div>
				)}
			</div>
		</div>
	);
}
