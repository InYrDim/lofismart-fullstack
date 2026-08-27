import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/utils";

interface CashPaymentProps {
	totalAmount: number;
	cashAmount: string;
	onCashChange: (value: string) => void;
}

export const CashPayment: React.FC<CashPaymentProps> = ({
	totalAmount,
	cashAmount,
	onCashChange,
}) => {
	const presetAmounts = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

	return (
		<div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
			<div>
				<p className="text-sm font-medium text-text-secondary block mb-1.5">
					Uang Cepat
				</p>
				<div className="grid grid-cols-4 gap-2">
					{presetAmounts.map((amount) => (
						<Button
							key={amount}
							onClick={() => onCashChange(amount.toString())}
							variant="outline"
							className="font-medium py-1.5 h-8 px-0 bg-bg-neutral! hover:bg-brand-primary! hover:text-white!"
						>
							{formatRupiah(amount).replace(",00", "").replace("Rp", "")}
						</Button>
					))}
					<Button
						onClick={() => onCashChange(Math.round(totalAmount).toString())}
						variant="primary"
						className="font-medium py-1.5 h-8 px-0 bg-white! border-brand-primary! outline-1 text-brand-primary! hover:bg-brand-primary/10!"
					>
						Uang Pas
					</Button>
				</div>
			</div>

			<div className="space-y-1">
				<label className="text-sm font-medium text-text-secondary mb-1.5 block">
					Jumlah Tunai
				</label>
				<Input
					type="text"
					value={cashAmount ? parseInt(cashAmount).toLocaleString("id-ID") : ""}
					onChange={(e) => {
						const rawValue = e.target.value.replace(/\D/g, "");
						onCashChange(rawValue);
					}}
					placeholder="0"
					autoFocus
					inputClassName="pl-10 font-bold text-lg h-10"
					leftAddon={
						<span className="text-text-muted font-bold ml-1 text-base">Rp</span>
					}
				/>
			</div>

			{/* Uang Cepat */}
		</div>
	);
};
