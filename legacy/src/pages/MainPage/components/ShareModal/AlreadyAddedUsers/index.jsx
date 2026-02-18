import isEmpty from "lodash/isEmpty";
import ODSIcon from "@/lib/oute-icon";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

import useAlreadyAddedUsers from "../hooks/useAlreadyAddedUsers";
import ROLE_OPTIONS from "../constant";
import Profile from "../Profile";
import RoleSelector from "../RoleSelector";

import InfoSkeleton from "./MembersInfoSkeleton";
import PeopleWithAccess from "./PeopleWithAccess";

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
			<div className="mb-5">
				<div className="relative w-full">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#90A4AE]" />
					<Input
						data-testid="search-user-input"
						className="min-h-[3.5rem] pl-10 pr-10"
						placeholder="Search by name or email"
						value={filterQuery}
						autoFocus={true}
						onChange={(e) => {
							setFilterQuery(e.target.value);
						}}
					/>
					{filterQuery && (
						<button
							className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
							onClick={() => setFilterQuery("")}
						>
							<X className="h-5 w-5" />
						</button>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-3 max-h-[32vh] overflow-y-auto pr-2" data-testid="users-list">
				{membersInfoLoading && isEmpty(users) ? (
					<InfoSkeleton />
				) : (
					<>
						<PeopleWithAccess filteredUsers={filteredUsers} />
						{filteredUsers.map((user, index) => (
							<div
								key={user?.userId}
								className="flex items-center justify-between py-3"
								data-testid={`user-item-${index}`}
							>
								<Profile
									name={user.name || ""}
									emailId={user.emailId || ""}
									meta={user.meta || {}}
									bgColor={user.bgColor || ""}
									index={index}
								/>

								<div className="min-w-[1.5rem] w-[20%] flex justify-end">
									{user?.role === "owner" ? (
										<div
											className="bg-[var(--Green-Green---50,#ebf5f2)] text-[var(--Light-Green-Green---900,#215c3f)] rounded-md p-2.5 w-full text-center"
											data-testid={`owner-badge`}
										>
											<span className="text-base text-[#215c3f]">
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
											className="w-full"
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
