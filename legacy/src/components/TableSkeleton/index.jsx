import { Skeleton } from "@/components/ui/skeleton";

import styles from "./styles.module.scss";

function SkeletonItem({ width }) {
	return (
		<div className={`${styles.skeleton_cell}`}>
			<Skeleton
				style={{
					width: width,
					height: "0.75rem",
					borderRadius: "6.25rem",
				}}
			/>
		</div>
	);
}

function HeaderSkeleton({ width }) {
	return (
		<div className={styles.header_skeleton}>
			<Skeleton
				style={{
					width: width,
					height: "1.25rem",
					borderRadius: "6.25rem",
				}}
			/>
		</div>
	);
}

function TableSkeleton({ columns = 4, rows = 14 }) {
	return (
		<div className={styles.skeleton_container}>
			<div className={styles.table_header}>
				<HeaderSkeleton width="2.375rem" />

				{Array.from({ length: columns }).map((_, colIndex) => (
					<HeaderSkeleton key={colIndex} width="11.12rem" />
				))}

				<HeaderSkeleton width="5.93rem" />
			</div>

			<div className={styles.table_body}>
				<div>
					{Array.from({ length: rows }).map((_, rowIndex) => (
						<SkeletonItem key={rowIndex} width="2.375rem" />
					))}
				</div>

				{Array.from({ length: columns }).map((_, colIndex) => (
					<div key={colIndex}>
						{Array.from({ length: rows }).map((_, rowIndex) => (
							<SkeletonItem
								key={rowIndex}
								width={
									rowIndex % 2 === 0 ? "6.87rem" : "11.12rem"
								}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

export default TableSkeleton;
