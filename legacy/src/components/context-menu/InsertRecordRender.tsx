import React from "react";

interface IInsertRecordRenderProps {
	onClick: (num: number) => void;
	icon: React.ReactElement;
	type: "InsertAbove" | "InsertBelow";
}

export const InsertRecordRender: React.FC<IInsertRecordRenderProps> = ({
	onClick,
	icon,
	type,
}) => {
	const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		onClick(1);
	};

	const label =
		type === "InsertAbove" ? "Insert record above" : "Insert record below";

	return (
		<div
			className="flex items-center px-3 py-2 cursor-pointer rounded-md mx-2 my-0.5 transition-colors hover:bg-[#f5f5f5]"
			onClick={handleContainerClick}
		>
			<div className="flex items-center flex-1 min-w-0">
				<div className="min-w-[32px] flex items-center">{icon}</div>
				<span className="text-[13px] font-[Inter,sans-serif] font-normal text-[#212121]">
					{label}
				</span>
			</div>
		</div>
	);
};
