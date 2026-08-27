import { Search } from "lucide-react";
import { Input } from "./ui/input";

export default function SearchBar({
	searchQuery,
	setSearchQuery,
	hint = "Cari produk...",
}: {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	hint?: string;
}) {
	return (
		<div className="flex-1 max-w-md mx-8">
			<Input
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				placeholder={hint}
				leftIcon={Search}
				fullWidth
				className="bg-gray-200/60 border-none focus:bg-white"
			/>
		</div>
	);
}
