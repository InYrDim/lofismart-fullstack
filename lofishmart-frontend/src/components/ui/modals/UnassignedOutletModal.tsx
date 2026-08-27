import { useAuth } from "@/hooks/useAuth";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";
import { Store, ShieldAlert, PhoneCall } from "lucide-react";
import { Modal, ModalFooter } from "./Modal";
import { Button } from "@/components/ui/button";

interface UnassignedOutletModalProps {
	isOpen: boolean;
	onClose: () => void;
	/** Tampilkan indikator loading pada tombol saat data user sedang disinkronkan ulang. */
	isLoading?: boolean;
}

export function UnassignedOutletModal({
	isOpen,
	onClose,
	isLoading = false,
}: UnassignedOutletModalProps) {
	const { marketId } = useAuth();
	const { isCashier, isSupervisor } = useRoleAndPermission();

	// Only relevant for KSR and SPVR roles
	const isScopedRole = isCashier || isSupervisor;

	// User has no market assigned
	const hasNoMarket = !marketId;

	const show = isOpen && isScopedRole && hasNoMarket;

	const roleLabel = isCashier ? "Kasir" : "Supervisor";

	return (
		<Modal
			isOpen={show}
			onClose={onClose}
			variant="warning"
			layout="center"
			title="Akses Terbatas"
			description="Outlet belum ditentukan"
			size="lg"
			overlayClassName="z-[60]"
		>
			<div className="space-y-5 text-center">
				{/* Icon */}
				<div className="mx-auto w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
					<Store className="w-7 h-7 text-amber-600" strokeWidth={2} />
				</div>

				{/* Main Message */}
				<div className="space-y-2">
					<p className="text-sm font-semibold text-gray-800">
						Akun <span className="text-amber-600">{roleLabel}</span> ini belum
						terdaftar di outlet/manapun.
					</p>
					<p className="text-sm text-gray-500 leading-relaxed">
						Anda tidak dapat mengakses halaman ini sebelum Administrator
						menetapkan outlet tempat Anda bertugas.
					</p>
				</div>

				{/* Instruction Card */}
				<div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-3">
					<div className="flex items-start gap-3">
						<ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
						<div>
							<p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
								Langkah yang perlu dilakukan:
							</p>
							<ol className="mt-2 text-xs text-amber-800 space-y-1.5 list-decimal list-inside">
								<li>Hubungi Administrator / Manager toko Anda.</li>
								<li>
									Minta admin untuk menetapkan outlet (market) pada akun{" "}
									<span className="font-semibold">{roleLabel}</span> Anda
									melalui menu Manajemen User di sistem.
								</li>
								<li>
								Setelah outlet ditetapkan, tekan tombol{" "}
								<span className="font-semibold">"Saya Mengerti"</span> di
								bawah untuk memuat data terbaru dan membuka akses.
							</li>
							</ol>
						</div>
					</div>
					<div className="flex items-start gap-3 pt-1 border-t border-amber-200/60">
						<PhoneCall className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
						<div>
							<p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
								Info untuk Admin
							</p>
							<p className="mt-1 text-xs text-amber-800">
								Admin bisa mengatur outlet melalui menu{" "}
								<span className="font-semibold">
									Management User → Edit User → Pilih Outlet
								</span>
								, lalu simpan perubahan.
							</p>
						</div>
					</div>
				</div>

				{/* Action */}
				<ModalFooter className="justify-center pt-0">
					<Button
						variant="primary"
						onClick={onClose}
						disabled={isLoading}
						className="min-w-[140px]"
					>
						{isLoading ? "Memeriksa..." : "Saya Mengerti"}
					</Button>
				</ModalFooter>
			</div>
		</Modal>
	);
}
