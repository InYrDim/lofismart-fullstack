import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft, LayoutDashboard, Warehouse } from "lucide-react";
import { Button } from "./ui/button";

interface ForbiddenProps {
	/** Alasan akses dibatasi, untuk menampilkan penjelasan yang lebih spesifik. */
	reason?: string;
}

const REASON_MESSAGES: Record<string, { title: string; message: string }> = {
	"no-gudang": {
		title: "Gudang Tidak Terdeteksi",
		message:
			"Akun Anda belum memiliki gudang yang ditetapkan. Untuk mengakses halaman kelola gudang, silakan hubungi administrator agar akun Anda dikaitkan ke gudang yang benar.",
	},
};

export const Forbidden: React.FC<ForbiddenProps> = ({ reason }) => {
	const navigate = useNavigate();
	const detail = reason ? REASON_MESSAGES[reason] : undefined;
	const title = detail?.title ?? "Akses Dibatasi";
	const message =
		detail?.message ??
		"Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.";

	return (
		<div className="flex flex-col items-center justify-center h-full bg-gray-50 px-6 w-full">
			<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
				{reason === "no-gudang" ? (
					<Warehouse className="w-10 h-10 text-red-600" />
				) : (
					<ShieldAlert className="w-10 h-10 text-red-600" />
				)}
			</div>
			<h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
			<p className="text-gray-500 text-center max-w-md mb-8">{message}</p>
			<div className="flex gap-4">
				<Button variant="outline" onClick={() => window.history.back()}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Kembali
				</Button>
				<Button
					className="bg-brand-primary hover:bg-brand-primary/90 text-white"
					onClick={() => navigate({ to: "/dashboard" })}
				>
					<LayoutDashboard className="w-4 h-4 mr-2" />
					Ke Dashboard
				</Button>
			</div>
		</div>
	);
};
