import isEmpty from "lodash/isEmpty";

const getFilterSummary = ({ filter }) => {
	const { childs } = filter || {};

	if (isEmpty(childs)) {
		return `Filter`;
	}

	const extractKeys = (child) => {
		const keys = [];
		child.forEach((node) => {
			if (node.key) {
				keys.push(node.key);
			}
			if (node.childs) {
				keys.push(...extractKeys(node.childs));
			}
		});
		return keys;
	};

	const keys = Array.from(new Set(extractKeys(childs)));

	if (keys.length > 3) {
		return `Filtered by ${keys[0]} and ${keys.length - 1} others`;
	}

	return `Filtered by ${keys.join(", ")}`;
};

export default getFilterSummary;
