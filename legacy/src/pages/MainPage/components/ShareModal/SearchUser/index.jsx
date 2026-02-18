import isEmpty from "lodash/isEmpty";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import ODSIcon from "@/lib/oute-icon";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { useRef, useEffect, useState } from "react";

import useSearchUser from "../hooks/useSearchUser";
import Profile from "../Profile";
import RoleSelector from "../RoleSelector";

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
		const alreadySelected = value.some((v) => v._id === option._id);
		if (!alreadySelected) {
			setValue([...value, option]);
		}
		setInputValue("");
		setSearchQuery("");
		setShowDropdown(false);
	};

	const handleRemoveUser = (index) => {
		const newValue = value.filter((_, i) => i !== index);
		setValue(newValue);
	};

	return (
		<>
			<div className="flex gap-3 items-start mb-5">
				<div className="flex w-full">
					<div className="flex-1 relative">
						<div className="min-h-[3.5rem] border rounded-l-md border-r-0 px-2.5 py-1 flex flex-wrap items-center gap-1">
							{(value || []).map((option, index) => {
								const isLast = index === value.length - 1;
								return (
									<Badge
										key={option._id}
										variant="secondary"
										className="text-sm font-normal"
										ref={isLast ? (el) => { chipScrollRef.current.lastChipElement = el; } : undefined}
									>
										{option?.email_id}
										<button
											className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
											onClick={() => handleRemoveUser(index)}
										>
											<X className="h-3 w-3 text-[#212121] cursor-pointer" />
										</button>
									</Badge>
								);
							})}
							<input
								className="flex-1 min-w-[120px] outline-none border-none text-sm bg-transparent"
								placeholder={isEmpty(value) ? "Search by name or email" : ""}
								value={inputValue}
								onChange={handleInputChange}
								onFocus={() => inputValue.length > 0 && setShowDropdown(true)}
								onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
								aria-label="Search by name or email"
							/>
						</div>
						{showDropdown && searchResults.length > 0 && (
							<div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
								{searchResults.map((option, index) => (
									<div
										key={option._id}
										className="cursor-pointer hover:bg-gray-100 p-2"
										onMouseDown={() => handleSelectUser(option)}
									>
										<Profile
											selected={false}
											name={option.name}
											emailId={option.email_id}
											meta={option.meta}
											index={index}
											avatarSx={{
												height: "2.5rem",
												width: "2.5rem",
											}}
										/>
									</div>
								))}
							</div>
						)}
						{showDropdown && searchResults.length === 0 && inputValue && (
							<div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-3 text-sm text-gray-500">
								No users found
							</div>
						)}
					</div>

					<RoleSelector
						data-testid={`invitee-role-select`}
						value={selectedRole}
						onChange={(e, value) => {
							setSelectedRole(value);
						}}
						hideOptions={["remove access"]}
						className="max-w-[7rem]"
					/>
				</div>

				<Button
					className="inline-flex items-center"
					onClick={handleInvite}
					disabled={isEmpty(value)}
					data-testid="invite-button"
					variant="default"
				>
					{(inviteMembersLoading || getMembersLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					INVITE
				</Button>
			</div>

			<div
				className="cursor-pointer w-fit"
				onClick={() => {
					setNotifyInvitedUsers((prev) => !prev);
				}}
			>
				<div className="flex items-center gap-1">
					<Checkbox
						checked={notifyInvitedUsers}
						onCheckedChange={(checked) => setNotifyInvitedUsers(checked)}
						className="w-fit p-0"
					/>
					<span className="text-sm font-normal ml-1 w-fit">
						Notify invited users that this sheet has been shared with them.
					</span>
				</div>
			</div>
		</>
	);
};

export default SearchUser;
