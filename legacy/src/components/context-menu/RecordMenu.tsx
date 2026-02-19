import React, { useCallback, useMemo } from "react";
import { useGridViewStore } from "@/stores/gridViewStore";
import { Separator } from "@/components/ui/separator";
import ComingSoonTag from "@/components/common/ComingSoonTag";
import { InsertRecordRender } from "./InsertRecordRender";
import { recordMenuConfig } from "./RecordMenu/configuration";

export const RecordMenu: React.FC = () => {
	const { recordMenu, closeRecordMenu } = useGridViewStore();

	const record = recordMenu?.record;
	const isMultipleSelected = recordMenu?.isMultipleSelected || false;
	const insertRecord = recordMenu?.insertRecord;
	const duplicateRecord = recordMenu?.duplicateRecord;
	const deleteRecords = recordMenu?.deleteRecords;
	const position = recordMenu?.position;

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
		if (!recordMenu) {
			return [];
		}

		const items: any[] = [];
		let currentSection = 0;

		const callbacks = {
			insertRecord: insertRecordFn,
			duplicateRecord,
			deleteRecords,
		};

		recordMenuConfig.forEach((config) => {
			if (config.hidden && config.hidden(isMultipleSelected, record, callbacks)) {
				return;
			}

			if (config.section > currentSection && currentSection > 0) {
				items.push({
					id: `divider-${config.section}`,
					type: "divider",
				});
			}
			currentSection = config.section;

			const rightAdornments: React.ReactNode[] = [];
			if (config.hasComingSoon) {
				rightAdornments.push(
					<ComingSoonTag
						key="coming-soon"
						text="Coming soon"
						variant="gray"
					/>,
				);
			}

			const label =
				typeof config.label === "function"
					? config.label(isMultipleSelected)
					: config.label;

			if (config.usesCustomRender && record && !isMultipleSelected) {
				const insertPosition =
					config.id === "insert-above" ? "before" : "after";
				items.push({
					id: config.id,
					type: "custom-render",
					label,
					iconName: config.iconName,
					isDestructive: config.isDestructive,
					rightAdornments,
					render: (
						<InsertRecordRender
							onClick={(num: number) => {
								insertRecordFn(num, insertPosition);
								closeRecordMenu();
							}}
							icon={
								<span
									style={{
										color: "#212121",
										width: "1.25rem",
										height: "1.25rem",
										display: "inline-flex",
										alignItems: "center",
									}}
								/>
							}
							type={
								config.id === "insert-above"
									? "InsertAbove"
									: "InsertBelow"
							}
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
						config.onClick(
							record,
							callbacks,
							position,
							closeRecordMenu,
						);
					},
				});
			}
		});

		return items;
	}, [
		recordMenu,
		record,
		isMultipleSelected,
		insertRecordFn,
		duplicateRecord,
		deleteRecords,
		position,
		closeRecordMenu,
	]);

	if (!recordMenu || menuItems.length === 0) {
		return null;
	}

	const visible = Boolean(recordMenu);

	return (
		<>
			{visible && position && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 999,
					}}
					onClick={closeRecordMenu}
				/>
			)}
			<div
				style={{
					position: "fixed",
					top: position?.y ?? 0,
					left: position?.x ?? 0,
					zIndex: 1000,
					minWidth: "200px",
					padding: "4px 0",
					boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
					border: "0.0625rem solid #e5e7eb",
					borderRadius: "0.375rem",
					backgroundColor: "#fff",
					display: visible ? "block" : "none",
				}}
			>
				{menuItems.map((item: any) => {
					if (item.type === "divider") {
						return (
							<Separator
								key={item.id}
								className="my-1"
								style={{ backgroundColor: "#E0E0E0" }}
							/>
						);
					}

					if (item.type === "custom-render") {
						return (
							<div key={item.id} style={{ padding: 0 }}>
								{item.render}
							</div>
						);
					}

					return (
						<div
							key={item.id}
							onClick={item.onClick}
							style={{
								padding: "0.5rem 0.75rem",
								minHeight: "36px",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								borderRadius: "0.375rem",
								margin: "0.125rem 0.5rem",
								cursor: "pointer",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "#f5f5f5";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "transparent";
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									flex: 1,
								}}
							>
								<span style={{ minWidth: "32px", display: "inline-flex", alignItems: "center" }}>
									<span
										style={{
											color: "#212121",
											width: "1.25rem",
											height: "1.25rem",
										}}
									/>
								</span>
								<span
									style={{
										fontFamily: "Inter",
										fontSize: "13px",
										fontWeight: "400",
										color: item.isDestructive
											? "#F44336"
											: "#212121",
									}}
								>
									{item.label}
								</span>
							</div>
							{item.rightAdornments.length > 0 && (
								<div
									style={{
										display: "flex",
										alignItems: "center",
										marginLeft: "8px",
										gap: "4px",
									}}
								>
									{item.rightAdornments}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</>
	);
};
