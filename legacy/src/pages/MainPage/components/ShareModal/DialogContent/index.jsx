import AlreadyAddedUsers from "../AlreadyAddedUsers";
import GeneralAccess from "../GeneralAccess";
import SearchUser from "../SearchUser";

import styles from "./styles.module.scss";

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
		<div className={styles.form_container}>
			<SearchUser getMembers={getMembers} />

			<div className={styles.divider} />

			<AlreadyAddedUsers
				membersInfoLoading={membersInfoLoading}
				users={users}
				setUsers={setUsers}
			/>

			<div className={styles.divider} />

			<GeneralAccess
				generalAccess={generalAccess}
				setGeneralAccess={setGeneralAccess}
				findOneAssetLoading={findOneAssetLoading}
			/>
		</div>
	);
}

export default DialogContent;
