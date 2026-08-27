import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title?: string;
	description?: string;
	size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
	className?: string; // Class for the modal container
	contentClassName?: string; // Class for the content area
	variant?: "default" | "success" | "error" | "warning" | "info";
	layout?: "default" | "center";
	overlayClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	children,
	title,
	description,
	size = "md",
	className = "",
	contentClassName = "",
	variant = "default",
	layout = "default",
	overlayClassName = "",
}) => {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const sizeClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
		"2xl": "max-w-2xl",
		"3xl": "max-w-3xl",
		"4xl": "max-w-4xl",
		full: "max-w-full m-4",
	};

	// Variant configurations
	const variantConfig = {
		default: {
			icon: null,
			iconBg: "",
			iconColor: "",
		},
		success: {
			icon: CheckCircle2,
			iconBg: "bg-green-100",
			iconColor: "text-green-500",
		},
		error: {
			icon: XCircle,
			iconBg: "bg-red-100",
			iconColor: "text-red-500",
		},
		warning: {
			icon: AlertTriangle,
			iconBg: "bg-yellow-100",
			iconColor: "text-yellow-600",
		},
		info: {
			icon: Info,
			iconBg: "bg-blue-100",
			iconColor: "text-blue-500",
		},
	};

	const config = variantConfig[variant];
	const Icon = config.icon;
	const isCenter = layout === "center";

	// Portal Implementation
	const modalContent = (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 ${overlayClassName}`}
		>
			<div
				ref={modalRef}
				className={`
          relative w-full ${sizeClasses[size] || ""} 
          bg-bg-surface rounded-2xl shadow-2xl border border-border-subtle
          max-h-full flex flex-col
          ${className}
        `}
				style={{
					animation: "modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Content Wrapper */}
				<div
					className={`p-6 overflow-y-auto ${
						isCenter ? "text-center flex flex-col items-center" : ""
					} ${contentClassName}`}
				>
					{/* Icon (for variants) */}
					{Icon && (
						<div
							className={`w-16 h-16 ${config.iconBg} ${config.iconColor} rounded-full flex items-center justify-center mb-4 shadow-sm ${
								isCenter ? "mx-auto" : ""
							}`}
						>
							<Icon className="w-8 h-8" strokeWidth={2.5} />
						</div>
					)}

					{/* Header */}
					{(title || description) && (
						<div
							className={`${
								isCenter
									? "mb-6 space-y-2"
									: "flex items-start justify-between pb-2 mb-4"
							}`}
						>
							<div className="space-y-1">
								{title && (
									<h3 className="text-xl font-bold leading-none tracking-tight text-text-primary">
										{title}
									</h3>
								)}
								{description && (
									<p className="text-sm text-text-muted">{description}</p>
								)}
							</div>

							{!isCenter && (
								<button
									onClick={onClose}
									className="rounded-full p-1 opacity-70 hover:opacity-100 hover:bg-bg-neutral transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 -mr-2 -mt-2"
								>
									<X className="h-5 w-5" />
									<span className="sr-only">Close</span>
								</button>
							)}
						</div>
					)}

					{children}
				</div>
			</div>
			{/* Backdrop click handler */}
			<div
				className="absolute inset-0 z-[-1]"
				onClick={onClose}
				aria-hidden="true"
			/>
			<style>{`
				@keyframes modal-pop {
					0% { opacity: 0; transform: scale(0.9) translateY(10px); }
					100% { opacity: 1; transform: scale(1) translateY(0); }
				}
			`}</style>
		</div>
	);

	return createPortal(modalContent, document.body);
};

export const ModalFooter: React.FC<{
	children: React.ReactNode;
	className?: string;
}> = ({ children, className = "" }) => {
	return (
		<div
			className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-6 ${className}`}
		>
			{children}
		</div>
	);
};
