// Phase 2C: Add Column Popover - Inspired by Teable's FieldSetting
// Reference: teable/apps/nextjs-app/src/features/app/components/field-setting/FieldSetting.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { CellType } from "@/types";
import styles from "./AddColumnPopover.module.scss";

export interface IAddColumnPopoverProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (name: string, type: CellType) => void;
	position: { x: number; y: number };
}

const CELL_TYPE_OPTIONS: Array<{ value: CellType; label: string }> = [
	{ value: CellType.String, label: "Text" },
	{ value: CellType.Number, label: "Number" },
	{ value: CellType.MCQ, label: "Multiple Choice" },
	{ value: CellType.PhoneNumber, label: "Phone Number" },
	{ value: CellType.Currency, label: "Currency" },
	{ value: CellType.ZipCode, label: "Zip Code" },
];

export const AddColumnPopover: React.FC<IAddColumnPopoverProps> = ({
	isOpen,
	onClose,
	onConfirm,
	position,
}) => {
	const [columnName, setColumnName] = useState("");
	const [columnType, setColumnType] = useState<CellType>(CellType.String);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);

	// Auto-focus name input when popover opens
	useEffect(() => {
		if (isOpen && nameInputRef.current) {
			// Small delay to ensure DOM is ready
			setTimeout(() => {
				nameInputRef.current?.focus();
				nameInputRef.current?.select();
			}, 0);
		} else if (!isOpen) {
			// Reset form when closing
			setColumnName("");
			setColumnType(CellType.String);
		}
	}, [isOpen]);

	// Handle Escape key to close
	useEffect(() => {
		if (!isOpen) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, onClose]);

	// Handle click outside to close
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node)
			) {
				onClose();
			}
		};

		// Use capture phase to catch clicks before they bubble
		document.addEventListener("mousedown", handleClickOutside, true);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside, true);
	}, [isOpen, onClose]);

	// Handle Enter key to submit
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSubmit();
			}
		},
		[columnName, columnType],
	);

	const handleSubmit = useCallback(() => {
		if (!columnName.trim()) {
			// Auto-generate name if empty
			const defaultName = `Column ${Date.now()}`;
			onConfirm(defaultName, columnType);
		} else {
			onConfirm(columnName.trim(), columnType);
		}
		onClose();
	}, [columnName, columnType, onConfirm, onClose]);

	if (!isOpen) {
		return null;
	}

	// Calculate popover position (ensure it stays within viewport)
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const popoverWidth = 320;
	const popoverHeight = 200;

	let popoverX = position.x;
	let popoverY = position.y + 10; // Offset below the append strip

	// Clamp to viewport
	if (popoverX + popoverWidth > viewportWidth) {
		popoverX = viewportWidth - popoverWidth - 10;
	}
	if (popoverX < 10) {
		popoverX = 10;
	}
	if (popoverY + popoverHeight > viewportHeight) {
		popoverY = position.y - popoverHeight - 10; // Show above instead
	}
	if (popoverY < 10) {
		popoverY = 10;
	}

	return (
		<div
			ref={popoverRef}
			className={styles.popover}
			style={{
				position: "fixed",
				left: `${popoverX}px`,
				top: `${popoverY}px`,
				zIndex: 10000,
			}}
		>
			<div className={styles.header}>
				<h3 className={styles.title}>Add Column</h3>
			</div>
			<div className={styles.content}>
				<div className={styles.field}>
					<label htmlFor="column-name" className={styles.label}>
						Column Name
					</label>
					<input
						ref={nameInputRef}
						id="column-name"
						type="text"
						className={styles.input}
						value={columnName}
						onChange={(e) => setColumnName(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Enter column name..."
					/>
				</div>
				<div className={styles.field}>
					<label htmlFor="column-type" className={styles.label}>
						Column Type
					</label>
					<select
						id="column-type"
						className={styles.select}
						value={columnType}
						onChange={(e) =>
							setColumnType(e.target.value as CellType)
						}
						onKeyDown={handleKeyDown}
					>
						{CELL_TYPE_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className={styles.footer}>
				<button
					type="button"
					className={styles.buttonCancel}
					onClick={onClose}
				>
					Cancel
				</button>
				<button
					type="button"
					className={styles.buttonConfirm}
					onClick={handleSubmit}
				>
					Add Column
				</button>
			</div>
		</div>
	);
};
