import ODSLabel from "oute-ds-label";
import ODSSwitch from "oute-ds-switch";

import InfoSkeleton from "../AlreadyAddedUsers/MembersInfoSkeleton";

import GeneralAccessOption from "./GeneralAccessOption";
import styles from "./styles.module.scss";

const GeneralAccess = ({
	generalAccess = {},
	setGeneralAccess,
	findOneAssetLoading = false,
}) => {
	const handleToggle = (key) => (e) => {
		setGeneralAccess((prev) => ({
			...prev,
			[key]: e.target.checked,
		}));
	};
	const ACCESS_OPTIONS = [
		{
			key: "anyoneWithLinkCanView",
			icon: "OUTEGlobeIcon",
			label: "Anyone with link can view",
			action: (
				<ODSSwitch
					variant="black"
					data-testid="anyone-with-link-toggle"
					checked={generalAccess.anyoneWithLinkCanView}
					onChange={handleToggle("anyoneWithLinkCanView")}
				/>
			),
		},
	];

	return (
		<div className={styles.general_access}>
			<ODSLabel variant="capital">General Access</ODSLabel>

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
