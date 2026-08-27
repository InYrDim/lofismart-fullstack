import { createContext } from "react";
import type { ScaleData } from "@/types";

export interface SerialPort {
	open(options: { baudRate: number }): Promise<void>;
	close(): Promise<void>;
	readable: ReadableStream<Uint8Array> | null;
	writable: WritableStream<Uint8Array> | null;
}

export interface SerialContextType {
	isConnected: boolean;
	isConnecting: boolean;
	baudRate: number;
	setBaudRate: (rate: number) => void;
	lastData: string;
	scaleData: ScaleData | null;
	error: string | null;
	connect: () => Promise<void>;
	disconnect: () => Promise<void>;
	send: (data: string | number) => Promise<void>;
	clearData: () => void;
	clearScaleData: () => void;
}

export const SerialContext = createContext<SerialContextType | null>(null);
