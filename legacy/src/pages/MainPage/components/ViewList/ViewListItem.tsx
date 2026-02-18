import React, { useState, useCallback, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { ViewIcon } from "@/constants/Icons/viewIcons";
import type { IView } from "@/types/view";
import { isDefaultView } from "@/types/view";

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

	useEffect(() => {
		if (!isEditing) {
			setEditValue(view.name);
			setOriginalName(view.name);
		}
	}, [view.name, isEditing]);

	useEffect(() => {
		if (isRenaming && !isEditing) {
			setIsEditing(true);
			setEditValue(view.name);
			setOriginalName(view.name);
		}
	}, [isRenaming, isEditing, view.name]);

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
			setEditValue(originalName);
			setIsEditing(false);
			onRenameCancel?.();
			return;
		}

		if (trimmedValue === originalName) {
			setIsEditing(false);
			onRenameCancel?.();
			return;
		}

		const success = await onRename(view.id, trimmedValue);
		
		if (success) {
			setIsEditing(false);
			setOriginalName(trimmedValue);
		} else {
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
			className={`flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-200 text-sm text-[#333] hover:bg-[#f5f5f5] ${isActive ? "!bg-[#e3f2fd] !text-[#1a73e8] font-medium" : ""}`}
			onClick={handleClick}
		>
			<div className="flex items-center gap-3 flex-1 min-w-0">
				<ViewIcon type={view.type} size={18} className="flex-shrink-0 text-inherit" />
				{isEditing ? (
					<input
						ref={inputRef}
						type="text"
						value={editValue}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						onBlur={handleBlur}
						className="flex-1 border-none outline-none bg-transparent text-sm font-inherit text-inherit p-0 m-0 min-w-0 w-full focus:outline-none focus:bg-white/50 focus:rounded focus:px-1 focus:py-0.5 selection:bg-[rgba(26,115,232,0.2)]"
						maxLength={100}
					/>
				) : (
					<>
						<span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{view.name}</span>
						{isDefaultView(view) && (
							<span className="inline-flex items-center px-1 py-px rounded-[3px] bg-[#e3f2fd] text-[#1976d2] text-[0.625rem] font-normal leading-[1.2] flex-shrink-0 ml-1.5 opacity-80">Default</span>
						)}
					</>
				)}
			</div>
			<button
				className="flex items-center justify-center p-1 border-none bg-transparent cursor-pointer rounded text-[#666] flex-shrink-0 transition-all duration-200 select-none hover:bg-black/5 hover:text-[#333] active:bg-black/10 [&_svg]:block"
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
