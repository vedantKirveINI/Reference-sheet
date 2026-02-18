import { Skeleton } from "@/components/ui/skeleton";

function SkeletonItem({ width }) {
	return (
		<div className="p-4 bg-white">
			<Skeleton
				className="rounded-[6.25rem] h-3"
				style={{
					width,
					background:
						"linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
				}}
			/>
		</div>
	);
}

function HeaderSkeleton({ width }) {
	return (
		<div className="h-8 flex items-center px-4 bg-[#f2f6fb]">
			<Skeleton
				className="rounded-[6.25rem] h-5"
				style={{
					width,
					background:
						"linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
				}}
			/>
		</div>
	);
}

function TableSkeleton({ columns = 4, rows = 14 }) {
	return (
		<div className="bg-[#f2f6fb] h-full">
			<div className="border-b border-[#cfd8dc] bg-white flex">
				<HeaderSkeleton width="2.375rem" />

				{Array.from({ length: columns }).map((_, colIndex) => (
					<HeaderSkeleton key={colIndex} width="11.12rem" />
				))}

				<HeaderSkeleton width="5.93rem" />
			</div>

			<div className="flex">
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
