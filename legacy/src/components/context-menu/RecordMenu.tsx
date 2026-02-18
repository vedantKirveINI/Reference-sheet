import React, { useCallback, useMemo, useEffect, useRef } from "react";
import { useGridViewStore } from "@/stores/gridViewStore";
import ODSIcon from "@/lib/oute-icon";
import { Separator } from "@/components/ui/separator";
import ComingSoonTag from "@/components/common/ComingSoonTag";
import { InsertRecordRender } from "./InsertRecordRender";
import { recordMenuConfig } from "./RecordMenu/configuration";

export const RecordMenu: React.FC = () => {
	const { recordMenu, closeRecordMenu } = useGridViewStore();
	const menuRef = useRef<HTMLDivElement>(null);

	const record = recordMenu?.record;
	const isMultipleSelected = recordMenu?.isMultipleSelected || false;
	const insertRecord = recordMenu?.insertRecord;
	const duplicateRecord = recordMenu?.duplicateRecord;
	const deleteRecords = recordMenu?.deleteRecords;
	const position = recordMenu?.position;

	useEffect(() => {
		if (!recordMenu) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				closeRecordMenu();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [recordMenu, closeRecordMenu]);

	const insertRecordFn = useCallback(
		(num: number, position: "before" | "after") => {
			if (!recordMenu || !recordMenu.record) return;
			if (insertRecord) {
				insertRecord(recordMenu.record.id, position, num);
			}
		},
		[recordMenu, insertRecord],
	);

	const menuItems = useMemo(() => {
		if (!recordMenu) return [];

		const items: any[] = [];
		let currentSection = 0;

		const callbacks = {
			insertRecord: insertRecordFn,
			duplicateRecord,
			deleteRecords,
		};

		recordMenuConfig.forEach((config: any) => {
			if (config.hidden && config.hidden(isMultipleSelected, record, callbacks)) return;

			if (config.section > currentSection && currentSection > 0) {
				items.push({ id: `divider-${config.section}`, type: "divider" });
			}
			currentSection = config.section;

			const rightAdornments: React.ReactNode[] = [];
			if (config.hasComingSoon) {
				rightAdornments.push(
					<ComingSoonTag key="coming-soon" text="Coming soon" variant="gray" />,
				);
			}

			const label = typeof config.label === "function" ? config.label(isMultipleSelected) : config.label;

			if (config.usesCustomRender && record && !isMultipleSelected) {
				const insertPosition = config.id === "insert-above" ? "before" : "after";
				items.push({
					id: config.id,
					type: "custom-render",
					render: (
						<InsertRecordRender
							onClick={(num: number) => {
								insertRecordFn(num, insertPosition);
								closeRecordMenu();
							}}
							icon={
								<ODSIcon
									outeIconName={config.iconName}
									outeIconProps={{ size: 20, className: "text-[#212121]" }}
								/>
							}
							type={config.id === "insert-above" ? "InsertAbove" : "InsertBelow"}
						/>
					),
				});
			} else {
				items.push({
					id: config.id,
					type: "menu-item",
					label,
					iconName: config.iconName,
					isDestructive: config.isDestructive,
					rightAdornments,
					onClick: () => {
						config.onClick(record, callbacks, position, closeRecordMenu);
					},
				});
			}
		});

		return items;
	}, [
		recordMenu, record, isMultipleSelected, insertRecordFn,
		duplicateRecord, deleteRecords, position, closeRecordMenu,
	]);

	if (!recordMenu || menuItems.length === 0) return null;

	return (
		<div
			ref={menuRef}
			className="fixed z-50 min-w-[200px] py-1 bg-white rounded-md shadow-[0px_4px_6px_rgba(0,0,0,0.1)] border border-gray-200"
			style={{ top: position?.y, left: position?.x }}
		>
			{menuItems.map((item: any) => {
				if (item.type === "divider") {
					return <Separator key={item.id} className="my-1 bg-[#E0E0E0]" />;
				}

				if (item.type === "custom-render") {
					return <div key={item.id}>{item.render}</div>;
				}

				return (
					<button
						key={item.id}
						onClick={item.onClick}
						className="flex items-center justify-between w-[calc(100%-1rem)] px-3 py-2 min-h-[36px] rounded-md mx-2 my-0.5 hover:bg-[#f5f5f5] transition-colors text-left"
					>
						<div className="flex items-center flex-1">
							<span className="min-w-[32px] flex items-center">
								<ODSIcon
									outeIconName={item.iconName}
									outeIconProps={{ size: 20, className: "text-[#212121]" }}
								/>
							</span>
							<span
								className={`font-[Inter] text-[13px] font-normal ${item.isDestructive ? "text-[#F44336]" : "text-[#212121]"}`}
							>
								{item.label}
							</span>
						</div>
						{item.rightAdornments.length > 0 && (
							<div className="flex items-center ml-2 gap-1">
								{item.rightAdornments}
							</div>
						)}
					</button>
				);
			})}
		</div>
	);
};
