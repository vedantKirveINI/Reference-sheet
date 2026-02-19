import ODSAvatar from "oute-ds-avatar";
import ODSLabel from "oute-ds-label";

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
	return (
		<div className={styles.profile_container}>
			<ODSAvatar
				avatarProps={{
					src: meta?.thumbnail,
					sx: avatarSx,
				}}
				data-testid={`profile-avatar-${index}`}
			/>
			<div className={styles.profile_details}>
				<ODSLabel
					variant="body1"
					color={selected ? "#ffffff" : "#263238"}
					data-testid={`profile-name-${index}`}
					sx={{
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{name}
				</ODSLabel>
				<ODSLabel
					variant="subtitle2"
					color={selected ? "#ffffff" : "#607D8B"}
					data-testid={`profile-email-${index}`}
					sx={{
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{emailId}
				</ODSLabel>
			</div>
		</div>
	);
};

export default Profile;
