import { Skeleton } from "@/components/ui/skeleton";

function InfoSkeleton({ arrayLength = 1 }) {
	return (
		<>
			{[...Array(arrayLength)].map((_, index) => (
				<div
					key={index}
					className="flex items-center justify-between py-4"
					data-testid={`skeleton-user-${index}`}
				>
					<div className="flex items-center gap-4">
						<Skeleton className="w-8 h-8 rounded-full" />

						<div className="flex flex-col gap-2">
							<Skeleton className="w-[120px] h-5 rounded-full mb-2" />
							<Skeleton className="w-[160px] h-4 rounded-full" />
						</div>
					</div>

					<div className="min-w-[6.25rem]">
						<Skeleton className="w-[80px] h-10 rounded-md" />
					</div>
				</div>
			))}
		</>
	);
}

export default InfoSkeleton;
