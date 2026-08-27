export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	data?: unknown;
}

class LoggerService {
	private static instance: LoggerService;
	private logs: LogEntry[] = [];
	private readonly MAX_LOGS = 1000;
	private readonly STORAGE_KEY = "pos_debug_logs";

	private constructor() {
		this.loadLogs();
	}

	public static getInstance(): LoggerService {
		if (!LoggerService.instance) {
			LoggerService.instance = new LoggerService();
		}
		return LoggerService.instance;
	}

	private loadLogs() {
		try {
			const saved = localStorage.getItem(this.STORAGE_KEY);
			if (saved) {
				this.logs = JSON.parse(saved);
			}
		} catch (e) {
			console.error("Failed to load logs", e);
		}
	}

	private saveLogs() {
		try {
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
		} catch (e) {
			// Storage might be full
			console.error("Failed to save logs", e);
		}
	}

	private addLog(level: LogLevel, message: string, data?: unknown) {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			message,
			data: data ? JSON.parse(JSON.stringify(data)) : undefined, // Basic sanitization
		};

		// Console output for dev tools
		const consoleArgs = [`[${level.toUpperCase()}] ${message}`, data].filter(
			Boolean
		);
		if (level === "error") console.error(...consoleArgs);
		else if (level === "warn") console.warn(...consoleArgs);
		else console.log(...consoleArgs);

		// Internal storage
		this.logs.unshift(entry);
		if (this.logs.length > this.MAX_LOGS) {
			this.logs = this.logs.slice(0, this.MAX_LOGS);
		}

		// Debounced save
		this.saveLogs();
	}

	// Public API
	info(message: string, data?: unknown) {
		this.addLog("info", message, data);
	}
	warn(message: string, data?: unknown) {
		this.addLog("warn", message, data);
	}
	error(message: string, data?: unknown) {
		this.addLog("error", message, data);
	}
	debug(message: string, data?: unknown) {
		this.addLog("debug", message, data);
	}

	getLogs(): LogEntry[] {
		return this.logs;
	}

	clearLogs() {
		this.logs = [];
		this.saveLogs();
	}

	downloadLogs() {
		const blob = new Blob([JSON.stringify(this.logs, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `lofishmart-pos-logs-${new Date()
			.toISOString()
			.slice(0, 19)
			.replace(/:/g, "-")}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
}

export const logger = LoggerService.getInstance();
