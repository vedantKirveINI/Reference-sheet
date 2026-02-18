import React, { useState, useCallback } from "react";
import { Search } from "lucide-react";

interface ViewSearchProps {
	onSearch: (query: string) => void;
	placeholder?: string;
}

function ViewSearch({
	onSearch,
	placeholder = "Find a view",
}: ViewSearchProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const query = e.target.value;
			setSearchQuery(query);
			onSearch(query);
		},
		[onSearch],
	);

	return (
		<div className="relative mb-3">
			<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" />
			<input
				type="text"
				className="w-full py-2 pl-9 pr-3 border border-[#e0e0e0] rounded-md text-sm transition-all duration-200 focus:outline-none focus:border-[#1a73e8] focus:shadow-[0_0_0_2px_rgba(26,115,232,0.1)] placeholder:text-[#999]"
				placeholder={placeholder}
				value={searchQuery}
				onChange={handleChange}
			/>
		</div>
	);
}

export default ViewSearch;
