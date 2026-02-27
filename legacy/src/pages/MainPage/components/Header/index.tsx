// Inspired by Teable's header component
import { useState } from "react";
import styles from "./styles.module.scss";

interface HeaderProps {
	sheetTitle?: string;
	onTitleChange?: (title: string) => void;
	useBackendHeaders: boolean;
	onToggleHeaders: (useBackendHeaders: boolean) => void;
	onRegenerate?: () => void;
}

function Header({
	sheetTitle = "Reference Sheet - String & Number Table",
	onTitleChange,
	useBackendHeaders,
	onToggleHeaders,
	onRegenerate,
}: HeaderProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [localTitle, setLocalTitle] = useState(sheetTitle);

	const handleSave = () => {
		if (onTitleChange) {
			onTitleChange(localTitle);
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setLocalTitle(sheetTitle);
		setIsEditing(false);
	};

	return (
		<header className={styles.header}>
			{/* Left: Title */}
			<div className={styles.headerLeft}>
				{isEditing ? (
					<input
						type="text"
						value={localTitle}
						onChange={(e) => setLocalTitle(e.target.value)}
						onBlur={handleSave}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleSave();
							} else if (e.key === "Escape") {
								handleCancel();
							}
						}}
						autoFocus
						className={styles.titleInput}
					/>
				) : (
					<h1 className={styles.title} onClick={() => setIsEditing(true)}>
						{sheetTitle}
					</h1>
				)}
			</div>

			{/* Right: Actions */}
			<div className={styles.headerRight}>
				<label className={styles.checkboxLabel}>
					<input
						type="checkbox"
						checked={useBackendHeaders}
						onChange={(e) => onToggleHeaders(e.target.checked)}
					/>
					<span className={styles.checkboxText}>Use Backend Headers</span>
				</label>

				{onRegenerate && (
					<button className={styles.regenerateButton} onClick={onRegenerate}>
						🔄 Regenerate Data
					</button>
				)}

				<div className={styles.actionButtons}>
					<button className={styles.iconButton} title="Share">
						🔗
					</button>
					<button className={styles.iconButton} title="Settings">
						⚙️
					</button>
					<button className={styles.iconButton} title="More">
						⋯
					</button>
				</div>
			</div>
		</header>
	);
}

export default Header;
