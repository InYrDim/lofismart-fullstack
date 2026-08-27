import React, { useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";

type AspectRatio = "square" | "video" | "auto" | "portrait" | "wide";
type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";
type RoundedSize = "none" | "sm" | "md" | "lg" | "xl" | "full";

interface ProductImageProps {
	src?: string | null;
	alt: string;
	className?: string;
	containerClassName?: string;
	aspectRatio?: AspectRatio;
	size?: ComponentSize;
	rounded?: RoundedSize;
	fallbackSrc?: string;
	showLoading?: boolean;
	objectFit?: "cover" | "contain" | "fill";
	children?: React.ReactNode;
}

const FALLBACK_IMAGE = "/default_product.png";

/**
 * A reusable component to handle product and service images with loading,
 * error states, and fallback support.
 */
export const ProductImage: React.FC<ProductImageProps> = ({
	src,
	alt,
	className = "",
	containerClassName = "",
	aspectRatio = "square",
	size = "full",
	rounded = "lg",
	fallbackSrc = FALLBACK_IMAGE,
	showLoading = true,
	objectFit = "cover",
	children,
}) => {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	const aspectClasses: Record<AspectRatio, string> = {
		square: "aspect-square",
		video: "aspect-video",
		portrait: "aspect-[3/4]",
		wide: "aspect-[16/9]",
		auto: "aspect-auto",
	};

	const sizeClasses: Record<ComponentSize, string> = {
		xs: "w-8 h-8",
		sm: "w-12 h-12",
		md: "w-16 h-16",
		lg: "w-24 h-24",
		xl: "w-32 h-32",
		full: "w-full h-full",
	};

	const roundedClasses: Record<RoundedSize, string> = {
		none: "rounded-none",
		sm: "rounded-sm",
		md: "rounded-md",
		lg: "rounded-lg",
		xl: "rounded-xl",
		full: "rounded-full",
	};

	const handleLoad = () => {
		setIsLoading(false);
	};

	const handleError = () => {
		setIsLoading(false);
		setHasError(true);
	};

	// Determine final source
	const finalSrc = hasError || !src ? fallbackSrc : src;

	return (
		<div
			className={`
				relative overflow-hidden bg-gray-100 flex items-center justify-center 
				${aspectClasses[aspectRatio]} 
				${sizeClasses[size]} 
				${roundedClasses[rounded]} 
				${containerClassName}
			`}
		>
			{/* Loading Shimmer/Spinner */}
			{isLoading && showLoading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50 animate-pulse">
					<Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
				</div>
			)}

			{/* The Image */}
			<img
				src={finalSrc}
				alt={alt}
				onLoad={handleLoad}
				onError={handleError}
				className={`
					w-full h-full transition-all duration-500
					${objectFit === "cover" ? "object-cover" : objectFit === "contain" ? "object-contain" : "object-fill"}
					${isLoading ? "scale-110 blur-sm opacity-0" : "scale-100 blur-0 opacity-100"}
					${className}
				`}
			/>

			{/* Error State Icon (Subtle overlay if fallback fails or is missing) */}
			{hasError && !fallbackSrc && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
					<ImageOff className="w-1/3 h-1/3 opacity-20" />
				</div>
			)}

			{/* Children Overlays (e.g., badges, SKU labels) */}
			{children && (
				<div className="absolute inset-0 z-20 pointer-events-none">
					{children}
				</div>
			)}
		</div>
	);
};

export default ProductImage;
