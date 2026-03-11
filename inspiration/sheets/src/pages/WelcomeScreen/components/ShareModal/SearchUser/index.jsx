import isEmpty from "lodash/isEmpty";
import ODSAutocomplete from "oute-ds-autocomplete";
import ODSCheckBox from "oute-ds-checkbox";
import ODSChip from "oute-ds-chip";
import ODSIcon from "oute-ds-icon";
import ODSLoadingButton from "oute-ds-loading-button";
import { useRef, useEffect } from "react";

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

	useEffect(() => {
		// Only scroll when chips are added (value length increases)
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
		// Update the previous length for next comparison
		chipScrollRef.current.prevLength = value.length;
	}, [value]);

	return (
		<>
			<div className={styles.search_user_section}>
				<div className={styles.search_input_container}>
					<ODSAutocomplete
						forcePopupIcon={false}
						variant="black"
						multiple={true}
						data-testid="user-select-autocomplete"
						options={searchResults} // Dynamically updating options based on search query
						searchable={true}
						value={value} // Bind the search query value
						filterOptions={(optionList) => {
							return optionList;
						}}
						onChange={(e, value) => {
							setValue(value);
						}}
						onInputChange={(event, newInputValue) => {
							setSearchQuery(newInputValue);
						}}
						isOptionEqualToValue={(option, selectedValue) => {
							return option._id === selectedValue._id;
						}}
						getOptionLabel={(option) => {
							return option?.email_id || "";
						}}
						aria-label="Search by name or email"
						textFieldProps={{
							placeholder: isEmpty(value)
								? "Search by name or email"
								: "",
						}}
						noOptionsText="No users found"
						renderOption={(props, option, { selected }) => {
							const {
								key,
								"data-option-index": dataOptionIndex,
								...rest
							} = props;

							return (
								<li
									{...rest}
									key={key}
									data-option-index={dataOptionIndex}
								>
									<Profile
										selected={selected}
										name={option.name}
										emailId={option.email_id}
										meta={option.meta}
										index={dataOptionIndex}
										avatarSx={{
											height: "2.5rem",
											width: "2.5rem",
										}}
									/>
								</li>
							);
						}}
						renderTags={(value, getTagProps) => {
							return (
								<div className={styles.tags_container}>
									{(value || []).map((option, index) => {
										const { key, ...tagProps } =
											getTagProps({
												index,
											});
										const isLast =
											index === value.length - 1;
										return (
											<div
												key={key}
												ref={
													isLast
														? (el) => {
																chipScrollRef.current.lastChipElement =
																	el;
															}
														: undefined
												}
											>
												<ODSChip
													label={option?.email_id}
													{...tagProps}
													size="small"
													deleteIcon={
														<ODSIcon
															outeIconName="OUTECloseIcon"
															outeIconProps={{
																sx: {
																	color: "#212121",
																	width: "0.9375rem",
																	height: "0.9375rem",
																	cursor: "pointer",
																},
															}}
															buttonProps={{
																sx: {
																	paddingTop:
																		"0.0625rem",
																},
															}}
														/>
													}
													sx={{
														color: "var(--cell-text-primary-color)",
														fontSize: "0.875rem",
														fontFamily:
															"var(--tt-font-family)",
													}}
												/>
											</div>
										);
									})}
								</div>
							);
						}}
						fullWidth={true}
						sx={{
							"& .MuiOutlinedInput-root": {
								minHeight: "3.5rem",
								borderRadius: "0.375rem 0rem 0rem 0.375rem",
								borderRight: "none",
								padding: "0.25rem 0.625rem",
							},
						}}
					/>

					<RoleSelector
						data-testid={`invitee-role-select`}
						value={selectedRole}
						onChange={(e, value) => {
							setSelectedRole(value);
						}}
						hideOptions={["remove access"]}
						sx={{
							maxWidth: "7rem",

							"& .MuiOutlinedInput-notchedOutline": {
								borderRadius: "0rem 0.375rem 0.375rem 0rem",
							},
							"& .MuiOutlinedInput-root": {
								minHeight: "3.5rem",
								padding: "0.625rem !important",
							},
						}}
					/>
				</div>

				<ODSLoadingButton
					className={styles.invite_button}
					onClick={handleInvite}
					disabled={isEmpty(value)}
					data-testid="invite-button"
					variant="black"
					loading={inviteMembersLoading || getMembersLoading}
					sx={{
						height: "3.5rem",
						padding: "0 2rem",
					}}
					label="INVITE"
				/>
			</div>

			<div
				className={styles.notify_invited_users_container}
				onClick={() => {
					setNotifyInvitedUsers((prev) => !prev);
				}}
			>
				<ODSCheckBox
					sx={{
						width: "fit-content",
						padding: "0rem",
					}}
					variant="black"
					checked={notifyInvitedUsers}
					labelText="Notify invited users that this sheet has been shared with them."
					labelProps={{
						fontSize: "0.875rem",
						fontWeight: "400",
						marginLeft: "0.25rem",
						width: "fit-content",
					}}
				/>
			</div>
		</>
	);
};

export default SearchUser;
