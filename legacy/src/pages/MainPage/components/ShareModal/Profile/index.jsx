import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import styles from "./styles.module.scss";

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
	const initials = name
		? name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";

	return (
		<div className={styles.profile_container}>
			<Avatar
				data-testid={`profile-avatar-${index}`}
				style={avatarSx}
			>
				{meta?.thumbnail ? (
					<AvatarImage src={meta.thumbnail} alt={name} />
				) : null}
				<AvatarFallback style={{ backgroundColor: bgColor || "#90A4AE", color: "#fff", fontSize: "0.75rem" }}>
					{initials}
				</AvatarFallback>
			</Avatar>
			<div className={styles.profile_details}>
				<span
					data-testid={`profile-name-${index}`}
					style={{
						fontSize: "0.875rem",
						color: selected ? "#ffffff" : "#263238",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{name}
				</span>
				<span
					data-testid={`profile-email-${index}`}
					style={{
						fontSize: "0.75rem",
						color: selected ? "#ffffff" : "#607D8B",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{emailId}
				</span>
			</div>
		</div>
	);
};

export default Profile;
