import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";

export const Forbidden: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col items-center justify-center h-full bg-gray-50 px-6 w-full">
			<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
				<ShieldAlert className="w-10 h-10 text-red-600" />
			</div>
			<h1 className="text-3xl font-bold text-gray-900 mb-2">Akses Dibatasi</h1>
			<p className="text-gray-500 text-center max-w-md mb-8">
				Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Silakan
				hubungi administrator jika Anda merasa ini adalah kesalahan.
			</p>
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
