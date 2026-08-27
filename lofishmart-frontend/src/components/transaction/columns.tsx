import { type ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Transaction } from "@/types"
import { formatRupiah } from "@/utils"
import { PaymentStatusBadge } from "@/components/ui/PaymentStatusBadge.old"

export const getColumns = (
  onEdit: (trx: Transaction) => void,
  onDelete: (trx: Transaction) => void
): ColumnDef<Transaction>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Kode Transaksi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium text-brand-primary">{row.getValue("code")}</div>
    ),
  },
  {
    accessorKey: "transaction_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateString = row.getValue("transaction_date") as string;
      const date = new Date(dateString)
      return (
        <div>
          <div className="text-sm font-medium text-gray-900">{format(date, "dd/MM/yyyy")}</div>
          <div className="text-xs text-gray-500">{format(date, "HH:mm")}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "customer_name",
    header: "Pelanggan",
    cell: ({ row }) => (
      <div className="text-sm text-gray-900">
        {row.getValue("customer_name") || "Umum"}
      </div>
    ),
  },
  {
    accessorKey: "cashier_name",
    header: "Kasir",
    cell: ({ row }) => (
      <div className="text-sm text-gray-900">{row.getValue("cashier_name")}</div>
    ),
  },
  {
    accessorKey: "payment_method",
    header: "Metode",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
        {row.getValue("payment_method") || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "is_paid",
    header: "Status",
    cell: ({ row }) => <PaymentStatusBadge isPaid={row.getValue("is_paid")} />,
  },
  {
    accessorKey: "total_price",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 data-[state=open]:bg-accent justify-end w-full"
          >
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_price"))
      return (
        <div className="text-right font-semibold text-gray-900">
          {formatRupiah(amount)}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => {
      const trx = row.original

      return (
        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(trx)}
            className="text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10"
            title="Edit Transaksi"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(trx)}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            title="Hapus Transaksi"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  },
]
