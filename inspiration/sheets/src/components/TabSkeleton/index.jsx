import Skeleton from "oute-ds-skeleton";

import styles from "./styles.module.scss";

function TabBarSkeleton() {
	return (
		<div className={styles.container}>
			<div className={styles.active_tab}>
				<Skeleton
					variant="rounded"
					width={80}
					height="1.375rem"
					sx={{
						borderRadius: "6.25rem",
						background:
							"linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
					}}
				/>
			</div>

			<div className={styles.divider} />

			<div className={styles.inactive_tab}>
				<Skeleton
					variant="rounded"
					width={100}
					height="1.375rem"
					sx={{
						borderRadius: "6.25rem",
						background:
							"linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
					}}
				/>
			</div>
		</div>
	);
}

export default TabBarSkeleton;
