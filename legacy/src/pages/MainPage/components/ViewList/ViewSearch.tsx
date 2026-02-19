import React, { useState, useCallback } from "react";
import { Search } from "lucide-react";
import styles from "./styles.module.scss";

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
		<div className={styles.searchContainer}>
			<Search size={16} className={styles.searchIcon} />
			<input
				type="text"
				className={styles.searchInput}
				placeholder={placeholder}
				value={searchQuery}
				onChange={handleChange}
			/>
		</div>
	);
}

export default ViewSearch;

