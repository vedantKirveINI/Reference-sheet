import Skeleton from "oute-ds-skeleton";

import styles from "./styles.module.scss";

function TableSubHeaderSkeleton() {
	return (
		<div className={styles.container}>
			<Skeleton
				variant="rounded"
				width="45%"
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

export default TableSubHeaderSkeleton;
