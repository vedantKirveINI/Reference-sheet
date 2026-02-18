import ODSIcon from "@/lib/oute-icon";

const GeneralAccessOption = ({ icon, label, action }) => {
	return (
		<div className="flex items-center justify-between">
			<div className="flex gap-5 items-center">
				<div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#eceff1]">
					<ODSIcon
						outeIconName={icon}
						outeIconProps={{
							size: 36,
							className: "text-[#212121]",
						}}
					/>
				</div>

				<span className="text-base font-medium font-inter">
					{label}
				</span>
			</div>

			<div className="pr-3">{action}</div>
		</div>
	);
};

export default GeneralAccessOption;
