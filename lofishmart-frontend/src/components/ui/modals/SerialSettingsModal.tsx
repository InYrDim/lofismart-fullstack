import { useState } from "react";
import { Plug, Unplug, Trash2, Activity, ExternalLink } from "lucide-react";
import { useSerial } from "@/hooks/useSerial";
import { useRoleAndPermission } from "@/hooks/useRoleAndPermission";
import { DebugLogs } from "@/components/DebugLogs";
import { Modal } from "./Modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface SerialSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const SerialSettingsModal: React.FC<SerialSettingsModalProps> = ({
	isOpen,
	onClose,
}) => {
	const [showDebug, setShowDebug] = useState(false);

	const { isAdmin } = useRoleAndPermission();

	const {
		isConnected,
		isConnecting,
		baudRate,
		setBaudRate,
		lastData,
		error,
		connect,
		disconnect,
		clearData,
	} = useSerial();

	const baudRates = [9600, 19200, 38400, 57600, 115200];

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				title="Pengaturan Serial"
				description="Konfigurasi koneksi ke perangkat timbangan serial."
				size="4xl"
			>
				<div className="flex gap-5 py-2">
					<div className="flex-1 flex flex-col gap-4">
						{/* Status Display */}
						<div
							className={"p-4 rounded-xl flex items-center justify-between border"}
						>
							<div className="flex items-center gap-2 font-medium">
								<Activity className="w-4 h-4" />
								<span>
									{isConnected
										? "Terhubung"
										: error
											? "Kesalahan Koneksi"
											: "Terputus"}
								</span>
							</div>
							{isConnected && (
								<span className="text-xs bg-white/50 px-2 py-1 rounded-md font-bold">
									{baudRate} baud
								</span>
							)}
						</div>

						{error && (
							<p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
								{error}
							</p>
						)}

						{/* Settings Form */}
						<div className="space-y-4">
							<Select
								label="Laju Baud (Baud Rate)"
								value={baudRate}
								onChange={(e: any) => setBaudRate(Number(e))}
								disabled={isConnected || isConnecting}
								options={baudRates.map((rate) => ({
									value: rate,
									label: String(rate),
								}))}
								fullWidth
							/>

							{/* Actions */}
							{isConnected ? (
								<Button
									onClick={disconnect}
									variant="danger"
									className="gap-2"
									fullWidth
								>
									<Unplug className="w-4 h-4" />
									Putuskan Perangkat
								</Button>
							) : (
								<Button
									onClick={connect}
									disabled={isConnecting}
									isLoading={isConnecting}
									className="gap-2"
									fullWidth
								>
									{!isConnecting && <Plug className="w-4 h-4" />}
									Hubungkan ke Port Serial
								</Button>
							)}
						</div>
					</div>

					<div className="mx-2 w-px bg-gray-200"></div>

					<div className="flex-1 flex flex-col gap-4 max-w-sm">
						{/* Data Monitor */}
						<div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-full">
							<div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
								<label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
									Monitor Data Masuk
								</label>
								<Button
									onClick={clearData}
									variant="ghost"
									size="sm"
									className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
								>
									<Trash2 className="w-3 h-3" />
								</Button>
							</div>
							<div className="flex-1 bg-gray-900 p-4 font-mono text-xs text-green-400 shadow-inner overflow-y-auto max-h-[200px]">
								{lastData || (
									<span className="text-gray-600 italic">
										Belum ada data yang diterima...
									</span>
								)}
							</div>
						</div>

						<Button
							variant="outline"
							onClick={() => setShowDebug(true)}
							className="gap-2"
							fullWidth
						>
							<Activity className="w-4 h-4" />
							Tampilkan Log
						</Button>

						{isAdmin && (
							<Button
								variant="outline"
								onClick={() => window.open("/test-remote-serial", "_blank")}
								className="gap-2"
								fullWidth
							>
								<ExternalLink className="w-4 h-4" />
								Remote Serial Test
							</Button>
						)}
					</div>
				</div>
			</Modal>
			{showDebug && <DebugLogs onClose={() => setShowDebug(false)} />}
		</>
	);
};
