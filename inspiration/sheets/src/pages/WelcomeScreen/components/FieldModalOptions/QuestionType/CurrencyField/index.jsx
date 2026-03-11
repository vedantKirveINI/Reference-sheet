// import Tab from "oute-ds-tab";
import React, { forwardRef, useImperativeHandle } from "react";

import getField from "../../../../../../form/getField";
import ErrorLabel from "../../common/ErrorLabel";
import getControls from "../../configuration/getCurrencyControls";
import useCurrencySettings from "../../hooks/useCurrencySettings";
import formatNumberData from "../../utils/formatNumberData";
import styles from "../commonStyles/styles.module.scss";

// import CurrencyFormComp from "./CurrencyFormComp";

// const TABS_MAPPING = {
// 	0: "formatting",
// 	1: "default",
// };

const { formattingControls } = getControls();

// const tabData = [
// 	{
// 		label: "FORMATTING",
// 		panelComponent: CurrencyFormComp,
// 		panelComponentProps: {
// 			controls: formattingControls,
// 		},
// 	},
// 	{
// 		label: "DEFAULT",
// 		panelComponent: CurrencyFormComp,
// 		panelComponentProps: {
// 			controls: defaultControls,
// 		},
// 	},
// ];

const CurrencyField = forwardRef(
	({ value = {}, controlErrorRef = {} }, ref) => {
		// const [activeTab, setActiveTab] = useState("formatting");

		const { formHook } = useCurrencySettings({
			value,
		});

		const {
			formState: { errors },
			handleSubmit,
			control,
		} = formHook;

		useImperativeHandle(ref, () => {
			return {
				saveFormData: () => {
					return new Promise((resolve, reject) => {
						handleSubmit(
							(formData) => {
								const data = formatNumberData({
									formData,
									// activeTab,
								});
								resolve(data);
							},
							(error) => reject(error),
						)();
					});
				},
			};
		}, [handleSubmit]);

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
	},
);

export default CurrencyField;
