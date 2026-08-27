import React, { useEffect, useRef } from "react";
import { useSerial } from "@/hooks/useSerial";
import { logger } from "@/services/logger.service";
import type { Product } from "@/types";
import { toast } from "sonner";
import { sendWebApiNotification } from "@/utils/webApiNotification";
import {
	DEDUP_MS,
	findProductByCode,
	buildSerialResponse,
	isScaleDataActive,
	isWeightResetSignal,
	makeDataKey,
} from "@/lib/serial";

interface ScaleListenerProps {
	products: Product[];
	onAddScaleItem: (product: Product, weight: number) => boolean;
}

export const ScaleListener: React.FC<ScaleListenerProps> = ({
	products,
	onAddScaleItem,
}) => {
	const { scaleData, send } = useSerial();
	const lastProcessedRef = useRef<{ key: string; time: number } | null>(null);

	// Keep latest references without triggering the effect
	const productsRef = useRef(products);
	const onAddScaleItemRef = useRef(onAddScaleItem);
	const sendRef = useRef(send);

	useEffect(() => {
		productsRef.current = products;
		onAddScaleItemRef.current = onAddScaleItem;
		sendRef.current = send;
	}, [products, onAddScaleItem, send]);

	useEffect(() => {
		if (!isScaleDataActive(scaleData)) {
			if (scaleData && isWeightResetSignal(scaleData)) {
				lastProcessedRef.current = null;
			}
			return;
		}

		const dataKey = makeDataKey(scaleData);
		const now = Date.now();

		if (
			lastProcessedRef.current?.key === dataKey &&
			now - lastProcessedRef.current.time < DEDUP_MS
		) {
			logger.debug("[ScaleListener] Skipped duplicate within debounce window", dataKey);
			return;
		}

		logger.debug("[ScaleListener] Processing new data", scaleData);

		const product = findProductByCode(productsRef.current, scaleData.itemCode);

		if (!product) {
			logger.warn("[ScaleListener] Product NOT found via code:", scaleData.itemCode);
			logger.debug(
				"[ScaleListener] Available codes:",
				productsRef.current.map((p) => ({ barcode: p.barcode, productId: p.productId, name: p.name })),
			);
			toast.error(`Produk tidak ditemukan: ${scaleData.itemCode}`);
			return;
		}

		const roundedWeight = Math.round(scaleData.weight * 100) / 100;

		logger.info("[ScaleListener] Adding to cart:", {
			name: product.name,
			weight: roundedWeight,
		});
		const added = onAddScaleItemRef.current(product, roundedWeight);

		if (!added) {
			logger.warn("[ScaleListener] Stock insufficient for:", product.name);
			toast.error(`Stok tidak mencukupi: ${product.name}`);
			return;
		}

		const response = buildSerialResponse(product, roundedWeight);
		sendRef.current(JSON.stringify(response)).catch((err) => {
			logger.error("[ScaleListener] Gagal mengirim data ke serial:", err);
		});

		lastProcessedRef.current = { key: dataKey, time: now };
		toast.success(`Berhasil menambahkan: ${product.name}`);
		sendWebApiNotification({
			title: "Pesanan Masuk",
			body: `${product.name} — ${roundedWeight} kg ditambahkan ke keranjang`,
			icon: "/default_product.png",
		});
	}, [scaleData]);

	return null;
};
