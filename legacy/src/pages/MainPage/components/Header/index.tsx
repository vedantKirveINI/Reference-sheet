// Inspired by Teable's header component
import { useState } from "react";

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
		<header className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#e0e0e0] shadow-[0_2px_4px_rgba(0,0,0,0.02)] min-h-[60px] gap-6 max-md:px-4 max-md:flex-wrap max-md:gap-3">
			{/* Left: Title */}
			<div className="flex-1 min-w-0">
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
						className="text-xl font-semibold text-[#333] border-2 border-[#1a73e8] rounded px-2 py-1 w-full outline-none"
					/>
				) : (
					<h1
						className="m-0 text-xl font-semibold text-[#333] cursor-pointer px-2 py-1 rounded transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis hover:bg-[#f5f5f5] max-md:text-base"
						onClick={() => setIsEditing(true)}
					>
						{sheetTitle}
					</h1>
				)}
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-4 max-md:flex-wrap max-md:gap-2">
				<label className="flex items-center gap-2 cursor-pointer select-none [&_input[type=checkbox]]:w-[18px] [&_input[type=checkbox]]:h-[18px] [&_input[type=checkbox]]:cursor-pointer [&_input[type=checkbox]]:accent-[#1a73e8]">
					<input
						type="checkbox"
						checked={useBackendHeaders}
						onChange={(e) => onToggleHeaders(e.target.checked)}
					/>
					<span className="text-sm text-[#666] max-md:text-xs">Use Backend Headers</span>
				</label>

				{onRegenerate && (
					<button
						className="px-4 py-2 bg-[#1a73e8] text-white border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-[#1557b0] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(26,115,232,0.3)] active:translate-y-0 max-md:px-3 max-md:py-1.5 max-md:text-xs"
						onClick={onRegenerate}
					>
						🔄 Regenerate Data
					</button>
				)}

				<div className="flex gap-2 items-center">
					<button className="w-9 h-9 border-none bg-none rounded-lg cursor-pointer text-lg transition-all duration-200 flex items-center justify-center hover:bg-[#f5f5f5] active:scale-95" title="Share">
						🔗
					</button>
					<button className="w-9 h-9 border-none bg-none rounded-lg cursor-pointer text-lg transition-all duration-200 flex items-center justify-center hover:bg-[#f5f5f5] active:scale-95" title="Settings">
						⚙️
					</button>
					<button className="w-9 h-9 border-none bg-none rounded-lg cursor-pointer text-lg transition-all duration-200 flex items-center justify-center hover:bg-[#f5f5f5] active:scale-95" title="More">
						⋯
					</button>
				</div>
			</div>
		</header>
	);
}

export default Header;
