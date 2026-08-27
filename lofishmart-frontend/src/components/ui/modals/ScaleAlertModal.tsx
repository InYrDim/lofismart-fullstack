import React from "react";
import { Scale, CheckCircle, X } from "lucide-react";
import { useSerial } from "@/hooks/useSerial";

export const ScaleAlertModal: React.FC = () => {
	const { scaleData, clearScaleData } = useSerial();

	if (!scaleData) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
				{/* Header */}
				<div className="bg-brand-action p-6 text-white text-center">
					<div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
						<Scale className="w-8 h-8 text-white" />
					</div>
					<h2 className="text-xl font-bold">Timbangan Terdeteksi</h2>
					<p className="text-brand-action-subtle text-sm mt-1 opacity-90">
						Data diterima dari {scaleData.scaleId}
					</p>
				</div>

				{/* Content */}
				<div className="p-6 space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
							<p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">
								Kode Item
							</p>
							<p className="font-mono text-lg font-bold text-text-primary">
								{scaleData.itemCode}
							</p>
						</div>
						<div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
							<p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">
								Berat
							</p>
							<p className="font-mono text-lg font-bold text-text-primary">
								{scaleData.weight}{" "}
								<span className="text-xs text-gray-400">kg</span>
							</p>
						</div>
						<div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
							<p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">
								Harga
							</p>
							<p className="font-mono text-lg font-bold text-text-primary">
								{scaleData.price}
							</p>
						</div>
						<div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
							<p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">
								Status
							</p>
							<div
								className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
									scaleData.status
										? "bg-green-100 text-green-700"
										: "bg-red-100 text-red-700"
								}`}
							>
								{scaleData.status ? (
									<>
										<CheckCircle className="w-3 h-3" /> Valid
									</>
								) : (
									<>
										<X className="w-3 h-3" /> Tidak Valid
									</>
								)}
							</div>
						</div>
					</div>

					<button
						onClick={clearScaleData}
						className="w-full py-3 bg-bg-neutral hover:bg-gray-200 text-text-primary font-bold rounded-xl transition-colors"
					>
						Tutup
					</button>
				</div>
			</div>
		</div>
	);
};
