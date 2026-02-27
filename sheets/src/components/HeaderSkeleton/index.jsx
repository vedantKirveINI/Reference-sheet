import Skeleton from "oute-ds-skeleton";

import styles from "./styles.module.scss";

function HeaderSkeleton() {
	return (
		<div className={styles.container}>
			<Skeleton
				variant="rounded"
				width="13.5rem"
				height="1.75rem"
				sx={{
					borderRadius: "6.25rem",
					background:
						"linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
				}}
			/>
			<Skeleton
				variant="rounded"
				width="5.3rem"
				height="1.75rem"
				sx={{
					borderRadius: "6.25rem",
					background:
						"linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
				}}
			/>
		</div>
	);
}

export default HeaderSkeleton;
