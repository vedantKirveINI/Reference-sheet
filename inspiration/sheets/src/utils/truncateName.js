function truncateName(name, limit = 40) {
	if (name && name.length > limit) {
		return name.substring(0, limit - 3) + "...";
	}
	return name;
}
export default truncateName;
