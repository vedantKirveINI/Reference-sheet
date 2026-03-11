import isEmpty from "lodash/isEmpty";

/**
 * Determines asset access status based on assetAccessDetails
 * @param {Object} assetAccessDetails - The asset access details object
 * @returns {Object} - Object containing access status flags
 */
function getAssetAccessDetails(assetAccessDetails) {
	// when sheet is created from scratch, assetAccessDetails is empty
	if (isEmpty(assetAccessDetails)) {
		return {
			hasAccess: true,
			isViewOnly: false,
			isEditable: true,
			isInTrash: false,
		};
	}

	const { can_access, can_edit, in_trash } = assetAccessDetails;

	return {
		hasAccess: can_access,
		isViewOnly: can_access && !can_edit,
		isEditable: can_access && can_edit,
		isInTrash: in_trash,
	};
}

export default getAssetAccessDetails;
