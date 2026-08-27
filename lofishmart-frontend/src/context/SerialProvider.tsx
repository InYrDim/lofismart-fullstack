import React, { useState, useCallback, useRef } from "react";
import { SerialContext, type SerialPort } from "./SerialContext";
import { logger } from "@/services/logger.service";
import type { ScaleData } from "@/types";
import { processSerialChunk } from "@/lib/serial";

interface SerialProviderProps {
	children: React.ReactNode;
}

export const SerialProvider: React.FC<SerialProviderProps> = ({ children }) => {
	const [isConnected, setIsConnected] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [baudRate, setBaudRate] = useState(115200);
	const [lastData, setLastData] = useState("");
	const [scaleData, setScaleData] = useState<ScaleData | null>(null);
	const [error, setError] = useState<string | null>(null);

	const portRef = useRef<SerialPort | null>(null);
	const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
	const keepReadingRef = useRef(false);
	const bufferRef = useRef(""); // Buffer for accumulating partial data

	const processBuffer = useCallback((incoming: string) => {
		logger.info("[SerialProvider] >>> Raw incoming chunk:", JSON.stringify(incoming));
		logger.info("[SerialProvider] >>> Buffer before:", JSON.stringify(bufferRef.current));

		const { messages, remaining } = processSerialChunk(
			bufferRef.current,
			incoming,
		);

		logger.info("[SerialProvider] <<< Messages parsed:", messages.length);
		logger.info("[SerialProvider] <<< Buffer remaining:", JSON.stringify(remaining));

		bufferRef.current = remaining;

		for (const msg of messages) {
			logger.info("[SerialProvider] <<< ScaleData DETECTED:", JSON.stringify(msg));
			logger.info("[SerialProvider]     itemCode:", msg.itemCode, "| weight:", msg.weight, "| status:", msg.status);
			setScaleData(msg);
		}

		if (messages.length === 0) {
			logger.info("[SerialProvider] No messages parsed yet. Buffer accumulated:", JSON.stringify(bufferRef.current));
		}
	}, []);

	const readLoop = useCallback(
		async (port: SerialPort) => {
			const textDecoder = new TextDecoderStream();
			if (!port.readable) return;
			const readableStreamClosed = port.readable.pipeTo(
				textDecoder.writable as WritableStream<Uint8Array>
			);
			const reader = textDecoder.readable.getReader();
			readerRef.current = reader;

			try {
				while (true) {
					const { value, done } = await reader.read();
					if (done) {
						logger.info("[SerialProvider] Read stream done.");
						break;
					}
					if (value) {
						logger.info("[SerialProvider] Raw chunk from serial port:", JSON.stringify(value));
						setLastData((prev) => (prev + value).slice(-5000));
						processBuffer(value);
					}
				}
			} catch (error) {
				logger.error("[SerialProvider] Read error:", error);
				setError("Terjadi kesalahan saat membaca dari perangkat.");
			} finally {
				reader.releaseLock();
				readerRef.current = null;
				try {
					await readableStreamClosed.catch(() => {});
					await port.close();
				} catch (e) {
					logger.error("[SerialProvider] Error closing port:", e);
				}
				processBuffer("\n");
				portRef.current = null;
				setIsConnected(false);
			}
		},
		[processBuffer]
	);

	const connect = useCallback(async () => {
		setError(null);
		setIsConnecting(true);

		if (!("serial" in navigator)) {
			setError("Web Serial API tidak didukung di browser ini. Gunakan Chrome/Edge dengan HTTPS atau localhost.");
			setIsConnecting(false);
			return;
		}

		try {
			logger.info("[SerialProvider] Requesting serial port...");
			const port = await (navigator as any).serial.requestPort();
			logger.info("[SerialProvider] Port selected, opening with baudRate:", baudRate);
			await port.open({ baudRate });

			portRef.current = port;
			setIsConnected(true);
			keepReadingRef.current = true;
			bufferRef.current = "";

			readLoop(port);
		} catch (err: unknown) {
			logger.error("[SerialProvider] Failed to connect:", err);

			const errorName = (err as DOMException)?.name || "";
			const errorMessage = (err as Error)?.message || "";

			logger.error("[SerialProvider] Error details - name:", errorName, "message:", errorMessage);

			switch (errorName) {
				case "NotFoundError":
					setError(
						"Port serial tidak ditemukan. Proses dibatalkan atau perangkat tidak ditemukan."
					);
					break;

				case "NetworkError":
					setError(
						"Gagal membuka port serial.\n\n" +
						"Kemungkinan penyebab:\n" +
						"- Port sudah digunakan oleh aplikasi lain (tutup aplikasi terminal serial lain)\n" +
						"- Perangkat tidak terhubung atau kabel tidak stabil\n" +
						"- Driver perangkat tidak terinstall dengan benar\n\n" +
						"Coba: cabut dan colok kembali perangkat, lalu klik Hubungkan lagi."
					);
					break;

				case "InvalidStateError":
					setError(
						"Port serial dalam keadaan tidak valid. Perangkat mungkin terputus.\n" +
						"Coba refresh halaman dan hubungkan kembali."
					);
					break;

				case "SecurityError":
					setError(
						"Izin untuk mengakses port serial ditolak. Pastikan halaman diakses melalui HTTPS atau localhost."
					);
					break;

				default:
					setError(
						"Gagal menghubungkan ke port serial.\n\n" +
						"Pesan error: " + errorMessage + "\n\n" +
						"Pastikan:\n" +
						"- Perangkat timbangan terhubung ke komputer\n" +
						"- Kabel USB berfungsi dengan baik\n" +
						"- Tidak ada aplikasi lain yang menggunakan port ini (Putty, Arduino IDE, dll)\n" +
						"- Coba gunakan baud rate yang berbeda"
					);
					break;
			}
			setIsConnected(false);
		} finally {
			setIsConnecting(false);
		}
	}, [baudRate, readLoop]);

	const disconnect = useCallback(async () => {
		if (readerRef.current) {
			keepReadingRef.current = false;
			await readerRef.current.cancel();
		} else if (portRef.current) {
			await portRef.current.close();
			portRef.current = null;
			setIsConnected(false);
		}
	}, []);

	const clearData = () => setLastData("");
	const clearScaleData = () => setScaleData(null);

	const send = useCallback(async (data: string | number) => {
		const port = portRef.current;
		if (!port?.writable) {
			throw new Error("Port serial tidak terhubung atau tidak dapat ditulisi.");
		}

		const writer = port.writable.getWriter();
		try {
			const encoded = new TextEncoder().encode(String(data) + "\n");
			logger.info("[SerialProvider] Sending to serial:", data);
			await writer.write(encoded);
		} finally {
			writer.releaseLock();
		}
	}, []);

	return (
		<SerialContext.Provider
			value={{
				isConnected,
				isConnecting,
				baudRate,
				setBaudRate,
				lastData,
				scaleData,
				error,
				connect,
				disconnect,
				send,
				clearData,
				clearScaleData,
			}}
		>
			{children}
		</SerialContext.Provider>
	);
};
