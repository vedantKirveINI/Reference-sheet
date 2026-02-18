function PeopleWithAccess({ filteredUsers = [] }) {
	return (
		<div className="mb-4">
			<span className="text-xs uppercase tracking-wider font-medium">People with access</span>
			<span
				className="bg-[#c8f4de] text-[#215c3f] text-base font-semibold px-1 rounded ml-2 text-center leading-7"
				data-testid="users-count-with-access"
			>
				{filteredUsers?.length}
			</span>
		</div>
	);
}

export default PeopleWithAccess;
