const ICON_URL =
	"https://cdn-v1.tinycommand.com/1234567890/1748606944982/InfoTables.svg";

const FileCounterDisplay = ({ fileCount }) => {
	return (
		<section
			className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#e5e7eb] rounded-xl bg-[#fafafa] cursor-not-allowed text-center gap-4 hover:border-[#d1d5db]"
			aria-label={`File count: ${fileCount}`}
			data-testid="file-counter-container"
		>
			<div
				className="flex justify-center mb-2"
				data-testid="file-counter-icon-wrapper"
			>
				<img
					src={ICON_URL || "/placeholder.svg"}
					alt="Information icon"
					className="w-12 h-12 object-contain"
					data-testid="file-counter-icon"
				/>
			</div>
			<div
				className="flex flex-col gap-2"
				data-testid="file-counter-content"
			>
				<h3
					className="text-xl font-semibold text-[#374151] m-0 leading-[1.4]"
					data-testid="file-counter-title"
				>
					File limit reached ({fileCount}).
				</h3>
				<p
					className="text-base text-[#6b7280] m-0 leading-6"
					data-testid="file-counter-description"
				>
					Remove the existing file to upload a new one.
				</p>
			</div>
		</section>
	);
};

export default FileCounterDisplay;
