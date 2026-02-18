import ODSIcon from "@/lib/oute-icon";

function ComingSoonTag({
	text = "Coming soon",
	variant = "default",
	className = "",
}) {
	const variantClasses = {
		default: "bg-[#F5F5F5] text-[#90A4AE] border border-[#E0E0E0] [&_svg]:text-[#90A4AE]",
		blue: "bg-[#E3F2FD] text-[#64B5F6] border border-[#BBDEFB] [&_svg]:text-[#64B5F6]",
		gray: "bg-[#F5F5F5] text-[#90A4AE] border border-[#E0E0E0] [&_svg]:text-[#90A4AE]",
	};

	return (
		<div
			className={`inline-flex items-center px-1.5 py-0.5 rounded-[10px] text-[10px] font-normal font-[Inter,sans-serif] whitespace-nowrap opacity-70 ${variantClasses[variant] || variantClasses.default} ${className}`}
		>
			<ODSIcon
				outeIconName="OUTEInfoIcon"
				outeIconProps={{
					size: 10,
					className: "mr-[3px]",
				}}
			/>
			<span className="leading-none">{text}</span>
		</div>
	);
}

export default ComingSoonTag;
