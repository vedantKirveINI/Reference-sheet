// Utility function to extract access details from asset access details
// Matches sheets repo pattern

interface IAssetAccessDetails {
	hasAccess?: boolean;
	isViewOnly?: boolean;
	isInTrash?: boolean;
}

export const getAssetAccessDetails = (
	assetAccessDetails: IAssetAccessDetails | null | undefined,
) => {
	return {
		hasAccess: assetAccessDetails?.hasAccess ?? true, // Default to true for now
		isViewOnly: assetAccessDetails?.isViewOnly ?? false,
		isInTrash: assetAccessDetails?.isInTrash ?? false,
	};
};

export default getAssetAccessDetails;
