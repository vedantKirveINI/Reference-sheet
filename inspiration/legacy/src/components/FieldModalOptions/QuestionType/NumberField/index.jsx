// import Tab from "oute-ds-tab";
import { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import getControls from "../../configuration/getNumberControls";
import useNumberSettings from "../../hooks/useNumberSettings";
import formatNumberData from "../../utils/formatNumberData";
import styles from "../commonStyles/styles.module.scss";

// import NumberFormComp from "./NumberFormComp";

// const TABS_MAPPING = {
// 	0: "formatting",
// 	1: "default",
// };

const { formattingControls } = getControls();

// const tabData = [
// 	{
// 		label: "FORMATTING",
// 		panelComponent: NumberFormComp,
// 		panelComponentProps: {
// 			controls: formattingControls,
// 		},
// 	},
// 	{
// 		label: "DEFAULT",
// 		panelComponent: NumberFormComp,
// 		panelComponentProps: {
// 			controls: defaultControls,
// 		},
// 	},
// ];

const NumberField = forwardRef(({ value = {}, controlErrorRef = {} }, ref) => {
	// const [activeTab, setActiveTab] = useState("formatting");

	const { formHook } = useNumberSettings({
		value,
	});

	const {
		formState: { errors },
		control,
		handleSubmit,
	} = formHook;

	useImperativeHandle(
		ref,
		() => ({
			saveFormData() {
				return new Promise((resolve, reject) => {
					handleSubmit(
						(formData) => {
							const data = formatNumberData({ formData });
							resolve(data);
						},
						(error) => reject(error),
					)();
				});
			},
		}),
		[handleSubmit],
	);

	return (
		<>
			{/*
		<Tab
			variant="black"
			tabData={tabData.map((info) => ({
				...info,
				panelComponentProps: {
					...info.panelComponentProps,
					control,
					errors,
					ref: controlErrorRef,
				},
			}))}
			defaultTabIndex={defaultActiveTab === "default" ? 1 : 0}
			onTabSwitch={(e) => {
				setActiveTab(TABS_MAPPING[e]);
			}}
		/>
		 */}
			{formattingControls.map((config) => {
				const { name, label, type } = config;
				const Element = getField(type);

				return (
					<div className={styles.field_container} key={name}>
						{/* Optional label rendering */}
						{/* {type !== "switch" && ( */}
						<div className={styles.label}>{label}</div>
						{/* )} */}

						<Element
							{...config}
							control={control}
							ref={(ele) => {
								if (ref?.current) {
									ref.current[name] = ele;
								}
							}}
						/>

						<ErrorLabel errors={errors} name={name} />
					</div>
				);
			})}
		</>
	);
});

export default NumberField;
