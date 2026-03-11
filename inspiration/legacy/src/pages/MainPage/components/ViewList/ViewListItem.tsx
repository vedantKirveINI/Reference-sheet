import React, { useState, useCallback, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { ViewIcon } from "@/constants/Icons/viewIcons";
import type { IView } from "@/types/view";
import { isDefaultView } from "@/types/view";
import styles from "./styles.module.scss";

interface ViewListItemProps {
	view: IView;
	isActive: boolean;
	onClick: (view: IView) => void;
	onMenuClick: (event: React.MouseEvent, view: IView) => void;
	onRename: (viewId: string, newName: string) => Promise<boolean>;
	isRenaming?: boolean;
	onRenameCancel?: () => void;
}

function ViewListItem({
	view,
	isActive,
	onClick,
	onMenuClick,
	onRename,
	isRenaming = false,
	onRenameCancel,
}: ViewListItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(view.name);
	const [originalName, setOriginalName] = useState(view.name);
	const inputRef = useRef<HTMLInputElement>(null);

	// Update editValue when view name changes externally
	useEffect(() => {
		if (!isEditing) {
			setEditValue(view.name);
			setOriginalName(view.name);
		}
	}, [view.name, isEditing]);

	// Start editing when isRenaming prop becomes true
	useEffect(() => {
		if (isRenaming && !isEditing) {
			setIsEditing(true);
			setEditValue(view.name);
			setOriginalName(view.name);
		}
	}, [isRenaming, isEditing, view.name]);

	// Auto-focus and select text when entering edit mode
	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditing]);

	const handleClick = useCallback(() => {
		if (!isEditing) {
			onClick(view);
		}
	}, [view, onClick, isEditing]);

	const handleMenuClick = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onMenuClick(e, view);
		},
		[view, onMenuClick],
	);

	const validateName = useCallback((name: string): boolean => {
		const trimmed = name.trim();
		if (!trimmed) {
			return false;
		}
		if (trimmed.length > 100) {
			return false;
		}
		return true;
	}, []);

	const handleSave = useCallback(async () => {
		const trimmedValue = editValue.trim();
		
		if (!validateName(trimmedValue)) {
			// Revert to original name if validation fails
			setEditValue(originalName);
			setIsEditing(false);
			onRenameCancel?.();
			return;
		}

		if (trimmedValue === originalName) {
			// No change, just exit edit mode
			setIsEditing(false);
			onRenameCancel?.();
			return;
		}

		// Call rename API
		const success = await onRename(view.id, trimmedValue);
		
		if (success) {
			setIsEditing(false);
			setOriginalName(trimmedValue);
		} else {
			// Revert to original name on failure
			setEditValue(originalName);
			setIsEditing(false);
			onRenameCancel?.();
		}
	}, [editValue, originalName, view.id, onRename, validateName, onRenameCancel]);

	const handleCancel = useCallback(() => {
		setEditValue(originalName);
		setIsEditing(false);
		onRenameCancel?.();
	}, [originalName, onRenameCancel]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				e.preventDefault();
				e.stopPropagation();
				handleSave();
			} else if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				handleCancel();
			}
		},
		[handleSave, handleCancel],
	);

	const handleBlur = useCallback(() => {
		// Small delay to allow menu clicks to register
		setTimeout(() => {
			handleSave();
		}, 100);
	}, [handleSave]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setEditValue(e.target.value);
		},
		[],
	);

	return (
		<div
			className={`${styles.viewItem} ${isActive ? styles.active : ""}`}
			onClick={handleClick}
		>
			<div className={styles.viewItemContent}>
				<ViewIcon type={view.type} size={18} className={styles.viewIcon} />
				{isEditing ? (
					<input
						ref={inputRef}
						type="text"
						value={editValue}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						onBlur={handleBlur}
						className={styles.editInput}
						maxLength={100}
					/>
				) : (
					<>
						<span className={styles.viewName}>{view.name}</span>
						{isDefaultView(view) && (
							<span className={styles.defaultTag}>Default</span>
						)}
					</>
				)}
			</div>
			<button
				className={styles.menuButton}
				onClick={handleMenuClick}
				type="button"
				aria-label="View options"
			>
				<MoreVertical size={16} />
			</button>
		</div>
	);
}

export default ViewListItem;

