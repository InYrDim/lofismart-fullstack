export const formatRupiah = (num: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(num);
};

/**
 * Generates a random 4-character alphanumeric ID.
 * Primarily used for master data entities (Category, Size, Grade) which have a varchar(4) primary key.
 */
export const generateMasterId = (): string => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let id = "";
	for (let i = 0; i < 4; i++) {
		id += chars[Math.floor(Math.random() * chars.length)];
	}
	return id;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const getImgUrl = (
	image?: string | null,
	type: "product" | "service" = "product",
): string => {
	if (!image) return "";
	if (/^(https?:)?\/\//.test(image) || image.startsWith("data:")) return image;

	const baseUrl = API_BASE_URL.replace(/\/$/, "");
	const normalizedImage = image.replace(/^\/+/, "");

	if (normalizedImage.startsWith("upload/")) {
		return `${baseUrl}/${normalizedImage}`;
	}

	return `${baseUrl}/upload/${type}/${normalizedImage}`;
};
