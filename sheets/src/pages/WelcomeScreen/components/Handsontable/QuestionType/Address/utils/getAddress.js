import { ADDRESS_KEY_MAPPING } from "./constant";

function getAddress(value) {
	if (!value) return "";

	try {
		const addressArray = ADDRESS_KEY_MAPPING.reduce((acc, curr) => {
			let curentAdd = value[curr];

			if (Boolean(curentAdd)) {
				return [...acc, curentAdd];
			}
			return acc;
		}, []);

		return addressArray.join(", ");
	} catch (error) {
		return "";
	}
}

export default getAddress;
