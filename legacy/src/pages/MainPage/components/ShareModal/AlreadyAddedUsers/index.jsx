import isEmpty from "lodash/isEmpty";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

import useAlreadyAddedUsers from "../hooks/useAlreadyAddedUsers";
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
				<div style={{ position: "relative", width: "100%" }}>
					<Search
						style={{
							position: "absolute",
							left: "0.625rem",
							top: "50%",
							transform: "translateY(-50%)",
							height: "1.5rem",
							width: "1.5rem",
							color: "#90A4AE",
							zIndex: 1,
						}}
					/>
					<Input
						data-testid="search-user-input"
						placeholder="Search by name or email"
						value={filterQuery}
						autoFocus={true}
						onChange={(e) => {
							setFilterQuery(e.target.value);
						}}
						style={{
							minHeight: "3.5rem",
							paddingLeft: "2.5rem",
							paddingRight: filterQuery ? "2.5rem" : undefined,
						}}
					/>
					{filterQuery && (
						<X
							style={{
								position: "absolute",
								right: "0.625rem",
								top: "50%",
								transform: "translateY(-50%)",
								height: "1.25rem",
								width: "1.25rem",
								cursor: "pointer",
								color: "#90A4AE",
							}}
							onClick={() => setFilterQuery("")}
						/>
					)}
				</div>
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
											data-testid="owner-badge"
										>
											<span style={{ fontSize: "0.875rem", color: "#215c3f" }}>
												Owner
											</span>
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
