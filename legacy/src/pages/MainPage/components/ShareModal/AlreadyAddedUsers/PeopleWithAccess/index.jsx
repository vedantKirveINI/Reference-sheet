import ODSLabel from "oute-ds-label";

import styles from "./styles.module.scss";

function PeopleWithAccess({ filteredUsers = [] }) {
	return (
		<div className={styles.users_header}>
			<ODSLabel variant="capital">People with access</ODSLabel>
			<span
				className={styles.users_count}
				data-testid="users-count-with-access"
			>
				{filteredUsers?.length}
			</span>
		</div>
	);
}

export default PeopleWithAccess;
