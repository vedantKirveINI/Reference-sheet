import isEmpty from "lodash/isEmpty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useRef, useEffect, useState } from "react";

import useSearchUser from "../hooks/useSearchUser";
import Profile from "../Profile";
import RoleSelector from "../RoleSelector";

import styles from "./styles.module.scss";

const SearchUser = ({ getMembers }) => {
	const {
		setSearchQuery,
		searchResults = [],
		value = [],
		setValue,
		inviteMembersLoading = false,
		getMembersLoading = false,
		selectedRole = {},
		setSelectedRole,
		handleInvite = () => {},
		notifyInvitedUsers = true,
		setNotifyInvitedUsers,
	} = useSearchUser({ getMembers });

	const chipScrollRef = useRef({ prevLength: 0, lastChipElement: null });
	const [inputValue, setInputValue] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);

	useEffect(() => {
		if (
			value.length > chipScrollRef.current.prevLength &&
			chipScrollRef.current.lastChipElement
		) {
			chipScrollRef.current.lastChipElement.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "end",
			});
		}
		chipScrollRef.current.prevLength = value.length;
	}, [value]);

	const handleInputChange = (e) => {
		const newValue = e.target.value;
		setInputValue(newValue);
		setSearchQuery(newValue);
		setShowDropdown(newValue.length > 0);
	};

	const handleSelectUser = (option) => {
		const alreadySelected = value.find((v) => v._id === option._id);
		if (!alreadySelected) {
			setValue([...value, option]);
		}
		setInputValue("");
		setSearchQuery("");
		setShowDropdown(false);
	};

	const handleRemoveUser = (index) => {
		setValue(value.filter((_, i) => i !== index));
	};

	const filteredResults = searchResults.filter(
		(option) => !value.find((v) => v._id === option._id),
	);

	return (
		<>
			<div className={styles.search_user_section}>
				<div className={styles.search_input_container}>
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							alignItems: "center",
							gap: "4px",
							border: "1px solid #e0e0e0",
							borderRadius: "0.375rem 0 0 0.375rem",
							padding: "0.25rem 0.625rem",
							minHeight: "3.5rem",
							flex: 1,
							position: "relative",
						}}
					>
						<div className={styles.tags_container} style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
							{(value || []).map((option, index) => {
								const isLast = index === value.length - 1;
								return (
									<div
										key={option._id || index}
										ref={
											isLast
												? (el) => {
														chipScrollRef.current.lastChipElement = el;
													}
												: undefined
										}
									>
										<Badge
											variant="secondary"
											style={{
												color: "var(--cell-text-primary-color)",
												fontSize: "0.875rem",
												fontFamily: "var(--tt-font-family)",
												display: "inline-flex",
												alignItems: "center",
												gap: "4px",
											}}
										>
											{option?.email_id}
											<X
												style={{
													color: "#212121",
													width: "0.9375rem",
													height: "0.9375rem",
													cursor: "pointer",
												}}
												onClick={(e) => {
													e.stopPropagation();
													handleRemoveUser(index);
												}}
											/>
										</Badge>
									</div>
								);
							})}
						</div>
						<input
							data-testid="user-select-autocomplete"
							placeholder={isEmpty(value) ? "Search by name or email" : ""}
							value={inputValue}
							onChange={handleInputChange}
							onFocus={() => inputValue && setShowDropdown(true)}
							onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
							aria-label="Search by name or email"
							style={{
								border: "none",
								outline: "none",
								flex: 1,
								minWidth: "100px",
								fontSize: "0.875rem",
								padding: "4px",
								background: "transparent",
							}}
						/>
						{showDropdown && filteredResults.length > 0 && (
							<div
								style={{
									position: "absolute",
									top: "100%",
									left: 0,
									right: 0,
									background: "#fff",
									border: "1px solid #e0e0e0",
									borderRadius: "0.375rem",
									maxHeight: "200px",
									overflowY: "auto",
									zIndex: 50,
								}}
							>
								{filteredResults.map((option, idx) => (
									<div
										key={option._id || idx}
										onClick={() => handleSelectUser(option)}
										style={{
											padding: "0.5rem",
											cursor: "pointer",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = "#f5f5f5";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = "transparent";
										}}
									>
										<Profile
											name={option.name}
											emailId={option.email_id}
											meta={option.meta}
											index={idx}
											avatarSx={{
												height: "2.5rem",
												width: "2.5rem",
											}}
										/>
									</div>
								))}
							</div>
						)}
						{showDropdown && filteredResults.length === 0 && inputValue && (
							<div
								style={{
									position: "absolute",
									top: "100%",
									left: 0,
									right: 0,
									background: "#fff",
									border: "1px solid #e0e0e0",
									borderRadius: "0.375rem",
									padding: "0.75rem",
									zIndex: 50,
									color: "#607D8B",
									fontSize: "0.875rem",
								}}
							>
								No users found
							</div>
						)}
					</div>

					<RoleSelector
						data-testid="invitee-role-select"
						value={selectedRole}
						onChange={(e, value) => {
							setSelectedRole(value);
						}}
						hideOptions={["remove access"]}
						sx={{
							maxWidth: "7rem",
							borderRadius: "0 0.375rem 0.375rem 0",
							minHeight: "3.5rem",
						}}
					/>
				</div>

				<Button
					className={styles.invite_button}
					onClick={handleInvite}
					disabled={isEmpty(value) || inviteMembersLoading || getMembersLoading}
					data-testid="invite-button"
					style={{
						height: "3.5rem",
						padding: "0 2rem",
					}}
				>
					{inviteMembersLoading || getMembersLoading ? "..." : "INVITE"}
				</Button>
			</div>

			<div
				className={styles.notify_invited_users_container}
				onClick={() => {
					setNotifyInvitedUsers((prev) => !prev);
				}}
				style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
			>
				<Checkbox
					checked={notifyInvitedUsers}
					onCheckedChange={(checked) => setNotifyInvitedUsers(checked)}
					style={{ width: "fit-content", padding: 0 }}
				/>
				<span style={{ fontSize: "0.875rem", fontWeight: 400, marginLeft: "0.25rem" }}>
					Notify invited users that this sheet has been shared with them.
				</span>
			</div>
		</>
	);
};

export default SearchUser;
