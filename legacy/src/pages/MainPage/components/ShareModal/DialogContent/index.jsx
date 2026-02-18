import AlreadyAddedUsers from "../AlreadyAddedUsers";
import GeneralAccess from "../GeneralAccess";
import SearchUser from "../SearchUser";

function DialogContent({
	membersInfoLoading = false,
	users = [],
	setUsers,
	getMembers = () => {},
	generalAccess,
	setGeneralAccess,
	findOneAssetLoading = false,
}) {
	return (
		<div className="p-8">
			<SearchUser getMembers={getMembers} />

			<div className="my-5 bg-[#cfd8dc] w-full h-[0.047rem]" />

			<AlreadyAddedUsers
				membersInfoLoading={membersInfoLoading}
				users={users}
				setUsers={setUsers}
			/>

			<div className="my-5 bg-[#cfd8dc] w-full h-[0.047rem]" />

			<GeneralAccess
				generalAccess={generalAccess}
				setGeneralAccess={setGeneralAccess}
				findOneAssetLoading={findOneAssetLoading}
			/>
		</div>
	);
}

export default DialogContent;
