import React from "react";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useMainLayout } from "./layouts/MainLayoutContext";

interface AppHeaderProps {
	title: string;
	description?: React.ReactNode;
	children?: React.ReactNode;
	extraHeaderContent?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, description, children, extraHeaderContent }) => {
	const { isSidebarOpen, setIsSidebarOpen } = useMainLayout();

	return (
		<div className="flex flex-col shrink-0">
			<header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shadow-sm shrink-0 z-10">
				<Button
					variant="ghost"
					size="icon-sm"
					className="-ml-2 text-slate-500 hidden md:block"
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
				>
					<Menu className="w-5 h-5" />
				</Button>

				<div>
					<h1 className="text-lg font-bold text-slate-900 tracking-tight">
						{title}
					</h1>
					{description && (
						<div className="text-[10px] text-slate-500 -mt-1">
							{description}
						</div>
					)}
				</div>

				{children && (
					<div className="ml-auto flex items-center gap-2">
						{children}
					</div>
				)}
			</header>
			{extraHeaderContent}
		</div>
	);
};
