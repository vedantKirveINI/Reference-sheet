import { isEmpty } from "lodash";
import { X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState, useRef, useEffect } from "react";

import styles from "./styles.module.scss";

function MultiSelect({
	value = [],
	options = [],
	onChange = () => {},
	applyBorder = false,
	disablePortal = false,
	popperMaxHeight = "18.75",
	autoFocusSearch = false,
	maxWidth = "",
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchText, setSearchText] = useState("");
	const containerRef = useRef(null);
	const inputRef = useRef(null);

	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	const filteredOptions = options.filter((opt) => {
		const label = typeof opt === "string" ? opt : String(opt);
		return label.toLowerCase().includes(searchText.toLowerCase());
	});

	const handleToggle = (option) => {
		const isSelected = value.includes(option);
		if (isSelected) {
			onChange(value.filter((v) => v !== option));
		} else {
			onChange([...value, option]);
		}
	};

	const handleRemove = (option, e) => {
		e.stopPropagation();
		onChange(value.filter((v) => v !== option));
	};

	return (
		<div
			ref={containerRef}
			style={{ position: "relative", width: "100%", maxWidth: maxWidth || undefined }}
		>
			<div
				onClick={() => {
					setIsOpen(!isOpen);
					if (!isOpen && autoFocusSearch) {
						setTimeout(() => inputRef.current?.focus(), 0);
					}
				}}
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: "4px",
					padding: "6px 8px",
					border: applyBorder ? "1px solid #ccc" : "1px solid transparent",
					borderRadius: "6px",
					minHeight: "36px",
					alignItems: "center",
					cursor: "pointer",
					backgroundColor: "#fff",
				}}
			>
				{value.map((option, index) => (
					<Badge
						key={index}
						variant="secondary"
						className="flex items-center gap-1 text-xs"
					>
						{option}
						<X
							className="h-3 w-3 cursor-pointer"
							onClick={(e) => handleRemove(option, e)}
						/>
					</Badge>
				))}
				{isEmpty(value) && (
					<span style={{ color: "#999", fontSize: "14px" }}>Select Option</span>
				)}
			</div>

			{isOpen && (
				<div
					style={{
						position: "absolute",
						top: "100%",
						left: 0,
						right: 0,
						zIndex: 1000,
						backgroundColor: "#fff",
						border: "1px solid #e0e0e0",
						borderRadius: "6px",
						boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
						maxHeight: `${popperMaxHeight}rem`,
						overflow: "auto",
					}}
				>
					<div style={{ padding: "6px" }}>
						<input
							ref={inputRef}
							type="text"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							placeholder="Search..."
							style={{
								width: "100%",
								padding: "6px 8px",
								border: "1px solid #e0e0e0",
								borderRadius: "4px",
								fontSize: "13px",
								outline: "none",
							}}
							autoFocus={autoFocusSearch}
						/>
					</div>
					<div style={{ padding: "4px" }}>
						{filteredOptions.map((option, index) => {
							const isSelected = value.includes(option);
							return (
								<div
									key={index}
									onClick={() => handleToggle(option)}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "8px",
										padding: "6px 8px",
										borderRadius: "4px",
										cursor: "pointer",
										backgroundColor: isSelected ? "#f0f0f0" : "transparent",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = "#f5f5f5";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = isSelected ? "#f0f0f0" : "transparent";
									}}
								>
									<Checkbox checked={isSelected} />
									<span style={{ fontSize: "14px" }}>
										{typeof option === "string" ? option : String(option)}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

export default MultiSelect;
