const Profile = ({
	name = "",
	emailId = "",
	meta = {},
	selected = false,
	bgColor = "",
	avatarSx = {
		height: "3rem",
		width: "3rem",
		backgroundColor: bgColor,
	},
	index = 0,
}) => {
	return (
		<div className="flex items-center gap-5 w-full">
			<div
				className="rounded-full overflow-hidden flex items-center justify-center bg-gray-200"
				style={avatarSx}
				data-testid={`profile-avatar-${index}`}
			>
				{meta?.thumbnail ? (
					<img
						src={meta.thumbnail}
						alt={name}
						className="w-full h-full object-cover"
					/>
				) : (
					<span className="text-sm font-medium text-gray-600">
						{name?.charAt(0)?.toUpperCase() || "?"}
					</span>
				)}
			</div>
			<div className="flex flex-col justify-center w-[80%]">
				<span
					className={`text-base truncate ${selected ? "text-white" : "text-[#263238]"}`}
					data-testid={`profile-name-${index}`}
				>
					{name}
				</span>
				<span
					className={`text-xs truncate ${selected ? "text-white" : "text-[#607D8B]"}`}
					data-testid={`profile-email-${index}`}
				>
					{emailId}
				</span>
			</div>
		</div>
	);
};

export default Profile;
