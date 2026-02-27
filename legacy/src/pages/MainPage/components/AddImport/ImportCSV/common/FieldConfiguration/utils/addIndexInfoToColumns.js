export function addIndexInfoToColumns(columns = []) {
	return columns.map((col, newIndex) => {
		let prev_index = newIndex;

		if (typeof col?.value === "string") {
			const [prevIndexStr] = col.value.split("_");
			prev_index = Number(prevIndexStr);
		}

		const { value, ...rest } = col; // remove internal 'value'

		return {
			...rest,
			prev_index,
			new_index: newIndex,
		};
	});
}
