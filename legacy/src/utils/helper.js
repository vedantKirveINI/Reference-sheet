const createRange = (start, end) => {
	const range = [];
	for (let i = start; i <= end; i++) {
		range.push(i);
	}
	return range;
};

export { createRange };
