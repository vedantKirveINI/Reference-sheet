import { Switch } from "@/components/ui/switch";
import { Globe } from "lucide-react";

import InfoSkeleton from "../AlreadyAddedUsers/MembersInfoSkeleton";

import GeneralAccessOption from "./GeneralAccessOption";
import styles from "./styles.module.scss";

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
			icon: (
				<Globe
					style={{
						height: "2.25rem",
						width: "2.25rem",
						color: "#212121",
					}}
				/>
			),
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
		<div className={styles.general_access}>
			<span style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>General Access</span>

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
