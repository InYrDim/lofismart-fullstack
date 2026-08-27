import BrandLogo from "./BrandLogo";

export default function Brand() {
	return (
		<div className="flex items-center gap-4">
			<div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
				<BrandLogo />
			</div>
			<div>
				<h1 className="font-bold text-xl tracking-tight text-gray-900">
					Lofish Mart
				</h1>
			</div>
		</div>
	);
}
