import { Skeleton } from "@/components/ui/skeleton";

import styles from "./styles.module.scss";

function InfoSkeleton({ arrayLength = 1 }) {
	return (
		<>
			{[...Array(arrayLength)].map((_, index) => (
				<div
					key={index}
					className={styles.user_item}
					data-testid={`skeleton-user-${index}`}
				>
					<div className={styles.profile_skeleton}>
						<Skeleton
							style={{
								width: 32,
								height: 32,
								borderRadius: "50%",
							}}
						/>

						<div className={styles.profile_details_skeleton}>
							<Skeleton
								style={{
									width: 120,
									height: "1.25rem",
									borderRadius: "6.25rem",
									marginBottom: "0.5rem",
								}}
							/>
							<Skeleton
								style={{
									width: 160,
									height: "1rem",
									borderRadius: "6.25rem",
								}}
							/>
						</div>
					</div>

					<div className={styles.role_skeleton}>
						<Skeleton
							style={{
								width: 80,
								height: "2.5rem",
								borderRadius: "0.375rem",
							}}
						/>
					</div>
				</div>
			))}
		</>
	);
}

export default InfoSkeleton;
