function truncateName(
	name: string | null | undefined,
	limit: number = 40,
): string {
	if (!name) return "";
	if (name.length > limit) {
		return name.substring(0, limit - 3) + "...";
	}
	return name;
}

export default truncateName;
