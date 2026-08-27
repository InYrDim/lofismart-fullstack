import { useEffect, useState } from "react";
import { logger, type LogEntry } from "@/services/logger.service";
import {
	Download,
	Trash2,
	X,
	FileText,
	Bug,
	AlertTriangle,
	Info,
} from "lucide-react";

interface DebugLogsProps {
	onClose: () => void;
}

export function DebugLogs({ onClose }: DebugLogsProps) {
	const [logs, setLogs] = useState<LogEntry[]>(() => logger.getLogs());
	const [filter, setFilter] = useState<"all" | "error" | "warn">("all");

	useEffect(() => {
		// Simple polling for live-ish updates (since we don't have an event emitter yet)
		const interval = setInterval(() => {
			setLogs(logger.getLogs());
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	const handleDownload = () => {
		logger.downloadLogs();
	};

	const handleClear = () => {
		logger.clearLogs();
		setLogs([]);
	};

	const filteredLogs = logs.filter((log) =>
		filter === "all" ? true : log.level === filter
	);

	const getIcon = (level: string) => {
		switch (level) {
			case "error":
				return <Bug className="w-4 h-4 text-red-500" />;
			case "warn":
				return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
			default:
				return <Info className="w-4 h-4 text-blue-500" />;
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
				{/* Header */}
				<div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
					<div className="flex items-center gap-2">
						<FileText className="w-5 h-5 text-gray-700" />
						<h2 className="font-semibold text-gray-800">Log Sistem</h2>
						<span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600">
							{logs.length} kejadian
						</span>
					</div>
					<div className="flex gap-2">
						<button
							onClick={handleDownload}
							className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
						>
							<Download className="w-4 h-4" />
							Export JSON
						</button>
						<button
							onClick={handleClear}
							className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
						>
							<Trash2 className="w-4 h-4" />
							Bersihkan
						</button>
						<button
							onClick={onClose}
							className="p-1 hover:bg-gray-200 rounded-md"
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>
				</div>

				{/* Toolbar */}
				<div className="p-2 border-b border-gray-100 flex gap-2">
					{["all", "error", "warn"].map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f as "all" | "error" | "warn")}
							className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-colors ${
								filter === f
									? "bg-gray-800 text-white"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							{f === "all" ? "Semua" : f === "error" ? "Error" : "Peringatan"}
						</button>
					))}
				</div>

				{/* Log List */}
				<div className="flex-1 overflow-auto p-4 space-y-2 font-mono text-sm bg-gray-50">
					{filteredLogs.length === 0 ? (
						<div className="text-center py-10 text-gray-400">
							Log tidak ditemukan
						</div>
					) : (
						filteredLogs.map((log, i) => (
							<div
								key={i}
								className="bg-white p-3 rounded border border-gray-100 shadow-sm flex gap-3 hover:shadow-md transition-shadow"
							>
								<div className="mt-0.5 shrink-0">{getIcon(log.level)}</div>
								<div className="flex-1 min-w-0">
									<div className="flex justify-between items-start mb-1">
										<span
											className={`text-xs font-bold uppercase ${
												log.level === "error"
													? "text-red-600"
													: log.level === "warn"
													? "text-yellow-600"
													: "text-blue-600"
											}`}
										>
											{log.level}
										</span>
										<span className="text-xs text-gray-400 shrink-0">
											{new Date(log.timestamp).toLocaleTimeString()}
										</span>
									</div>
									<p className="text-gray-800 break-words">{log.message}</p>
									{!!log.data && (
										<pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto text-gray-600 border border-gray-100">
											{JSON.stringify(log.data, null, 2)}
										</pre>
									)}
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}

