import React from "react";

import HeaderSkeleton from "../HeaderSkeleton";
import TableSkeleton from "../TableSkeleton";
import TableSubHeaderSkeleton from "../TableSubHeaderSkeleton";
import TabBarSkeleton from "../TabSkeleton";

import styles from "./styles.module.scss";

function SheetSkeleton() {
	return (
		<div className={styles.container}>
			<HeaderSkeleton />
			<TabBarSkeleton />
			<TableSubHeaderSkeleton />

			<div className={styles.table_skeleton}>
				<TableSkeleton />
			</div>
		</div>
	);
}

export default SheetSkeleton;
