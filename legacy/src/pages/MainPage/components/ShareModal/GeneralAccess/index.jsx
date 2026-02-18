import { Switch } from "@/components/ui/switch";

import InfoSkeleton from "../AlreadyAddedUsers/MembersInfoSkeleton";

import GeneralAccessOption from "./GeneralAccessOption";

const GeneralAccess = ({
	generalAccess = {},
	setGeneralAccess,
	findOneAssetLoading = false,
}) => {
	const handleToggle = (key) => (checked) => {
		setGeneralAccess((prev) => ({
			...prev,
			[key]: checked,
		}));
	};
	const ACCESS_OPTIONS = [
		{
			key: "anyoneWithLinkCanView",
			icon: "OUTEGlobeIcon",
			label: "Anyone with link can view",
			action: (
				<Switch
					data-testid="anyone-with-link-toggle"
					checked={generalAccess.anyoneWithLinkCanView}
					onCheckedChange={handleToggle("anyoneWithLinkCanView")}
				/>
			),
		},
	];

	return (
		<div className="flex flex-col gap-4">
			<span className="text-xs uppercase tracking-wider font-medium">General Access</span>

			{findOneAssetLoading ? (
				<InfoSkeleton />
			) : (
				ACCESS_OPTIONS.map((item) => (
					<GeneralAccessOption
						key={item.key}
						icon={item.icon}
						label={item.label}
						action={item.action}
					/>
				))
			)}
		</div>
	);
};

export default GeneralAccess;
