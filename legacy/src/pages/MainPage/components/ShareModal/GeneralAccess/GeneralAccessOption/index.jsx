import styles from "./styles.module.scss";

const GeneralAccessOption = ({ icon, label, action }) => {
	return (
		<div className={styles.option}>
			<div className={styles.label_group}>
				<div className={styles.icon_container}>
					{icon}
				</div>

				<span
					style={{ fontWeight: 500, fontFamily: "Inter", fontSize: "0.875rem" }}
				>
					{label}
				</span>
			</div>

			<div className={styles.action_container}>{action}</div>
		</div>
	);
};

export default GeneralAccessOption;
