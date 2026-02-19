import Skeleton from "oute-ds-skeleton";

import styles from "./styles.module.scss";

function InfoSkeleton({ arrayLength = 1 }) {
	return (
		<>
			{[...Array(arrayLength)].map((index) => (
				<div
					key={index}
					className={styles.user_item}
					data-testid={`skeleton-user-${index}`}
				>
					<div className={styles.profile_skeleton}>
						<Skeleton
							variant="circular"
							width={32}
							height={32}
							sx={{
								background:
									"linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
							}}
						/>

						<div className={styles.profile_details_skeleton}>
							<Skeleton
								variant="rounded"
								width={120}
								height="1.25rem"
								sx={{
									borderRadius: "6.25rem",
									background:
										"linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
									marginBottom: "0.5rem",
								}}
							/>
							<Skeleton
								variant="rounded"
								width={160}
								height="1rem"
								sx={{
									borderRadius: "6.25rem",
									background:
										"linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
								}}
							/>
						</div>
					</div>

					<div className={styles.role_skeleton}>
						<Skeleton
							variant="rounded"
							width={80}
							height="2.5rem"
							sx={{
								borderRadius: "0.375rem",
								background:
									"linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
							}}
						/>
					</div>
				</div>
			))}
		</>
	);
}

export default InfoSkeleton;
