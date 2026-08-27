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
	/**
	 * True when a serial port has been previously authorized for this origin
	 * (via navigator.serial.getPorts()), so we can reconnect without re-prompting
	 * the OS chooser. Helps recover after a page reload.
	 */
	hasAuthorizedPort: boolean;
	connect: () => Promise<void>;
	/**
	 * Reconnect to an already-authorized port returned by getPorts(), without
	 * showing the OS chooser. Resolves true on success.
	 */
	connectToAuthorizedPort: () => Promise<boolean>;
	disconnect: () => Promise<void>;
	send: (data: string | number) => Promise<void>;
	clearData: () => void;
	clearScaleData: () => void;
}

export const SerialContext = createContext<SerialContextType | null>(null);
