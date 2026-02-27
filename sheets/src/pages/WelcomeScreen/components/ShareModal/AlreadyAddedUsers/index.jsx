import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import ODSTextField from "oute-ds-text-field";

import useAlreadyAddedUsers from "../../Header/hooks/useAlreadyAddedUsers";
import ROLE_OPTIONS from "../constant";
import Profile from "../Profile";
import RoleSelector from "../RoleSelector";

import InfoSkeleton from "./MembersInfoSkeleton";
import PeopleWithAccess from "./PeopleWithAccess";
import styles from "./styles.module.scss";

const AlreadyAddedUsers = ({
	membersInfoLoading = false,
	users = [],
	setUsers,
}) => {
	const {
		filteredUsers = [],
		filterQuery = "",
		setFilterQuery,
		updateUserRole = () => {},
	} = useAlreadyAddedUsers({ users, setUsers });

	return (
		<>
			<div className={styles.filter_container}>
				<ODSTextField
					data-testid="search-user-input"
					fullWidth
					className="black"
					placeholder="Search by name or email"
					value={filterQuery}
					autoFocus={true}
					onChange={(e) => {
						setFilterQuery(e.target.value);
					}}
					sx={{
						"& .MuiOutlinedInput-root": {
							minHeight: "3.5rem",
							padding: "0.375rem 0.625rem",
						},
					}}
					InputProps={{
						startAdornment: (
							<ODSIcon
								outeIconName="OUTESearchIcon"
								outeIconProps={{
									sx: {
										height: "1.5rem",
										width: "1.5rem",
										color: "#90A4AE",
									},
								}}
							/>
						),
						endAdornment: filterQuery && (
							<ODSIcon
								outeIconName="OUTECloseIcon"
								outeIconProps={{
									sx: {
										height: "1.25rem",
										width: "1.25rem",
										pointerEvents: "all !important",
										cursor: "pointer",
									},
								}}
								onClick={() => setFilterQuery("")}
							/>
						),
					}}
				/>
			</div>

			<div className={styles.users_list} data-testid="users-list">
				{membersInfoLoading && isEmpty(users) ? (
					<InfoSkeleton />
				) : (
					<>
						<PeopleWithAccess filteredUsers={filteredUsers} />
						{filteredUsers.map((user, index) => (
							<div
								key={user?.userId}
								className={styles.user_item}
								data-testid={`user-item-${index}`}
							>
								<Profile
									name={user.name || ""}
									emailId={user.emailId || ""}
									meta={user.meta || {}}
									bgColor={user.bgColor || ""}
									index={index}
								/>

								<div className={styles.user_role_container}>
									{user?.role === "owner" ? (
										<div
											className={styles.owner_badge}
											data-testid={`owner-badge`}
										>
											<ODSLabel
												variant="subtitle1"
												color="#215c3f"
											>
												Owner
											</ODSLabel>
										</div>
									) : (
										<RoleSelector
											data-testid={`user-role-select-${index}`}
											value={ROLE_OPTIONS.find(
												(option) =>
													option?.value ===
													user?.role,
											)}
											onChange={(e, value) => {
												if (value) {
													updateUserRole({
														userId: user?.userId,
														newRole: value?.value,
													});
												}
											}}
											sx={{
												width: "100%",
											}}
											searchable={true}
										/>
									)}
								</div>
							</div>
						))}
					</>
				)}
			</div>
		</>
	);
};

export default AlreadyAddedUsers;
