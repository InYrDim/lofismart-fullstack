export const QUALITY_CRITERIA = [
	{ id: "1", label: "Grade A (Sangat Segar)", priceMultiplier: 1.2 },
	{ id: "2", label: "Segar", priceMultiplier: 1.0 },
	{ id: "3", label: "Kurang Segar", priceMultiplier: 0.8 },
	{ id: "4", label: "Tidak Segar", priceMultiplier: 0.5 },
];

export const SIZES = [
	{ id: "1", label: "Besar", priceMultiplier: 1.3 },
	{ id: "2", label: "Sedang", priceMultiplier: 1.0 },
	{ id: "3", label: "Kecil", priceMultiplier: 0.8 },
	{ id: "4", label: "Baby", priceMultiplier: 0.6 },
];

export const getGradingLabel = (sizeId: string, qualityId: string) => {
	const size = SIZES.find((s) => s.id === sizeId)?.label || "";
	const quality = QUALITY_CRITERIA.find((q) => q.id === qualityId)?.label || "";
	// Ambil hanya label pendek untuk quality (Misal: "Grade A" dari "Grade A (Sangat Segar)")
	const shortQuality = quality.split(" (")[0].replace("Grade ", "");

	return `${size} ${shortQuality}`; // Contoh: Besar A
};

export const generateSkuCode = (
	productCode: string,
	sizeId: string,
	qualityId: string
) => {
	return `${productCode}${sizeId}${qualityId}`;
};
