import styles from "./styles.module.scss";

function PeopleWithAccess({ filteredUsers = [] }) {
	return (
		<div className={styles.users_header}>
			<span style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>People with access</span>
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
