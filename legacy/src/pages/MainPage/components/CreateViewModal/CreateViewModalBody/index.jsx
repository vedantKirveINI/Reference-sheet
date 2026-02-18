import React from "react";
import getField from "@/common/forms/getField";
import ErrorLabel from "@/components/FieldModalOptions/common/ErrorLabel";
// import ODSIcon from "@/lib/oute-icon";
import styles from "./styles.module.scss";

function CreateViewModalBody({
	controls = [],
	control,
	errors = {},
	controlRef = null,
}) {
	return (
		<div className="flex flex-col gap-5 px-6 py-5">
			<h2 className="text-lg font-semibold text-[#1a1a1a] m-0 leading-[1.35]">Create new view</h2>
			{controls.map((config) => {
				const { name, label, type, description, optionDetails } = config || {};
				
				let updatedConfig = config;
				if (type === "radio" && optionDetails && name === "stackingField") {
					const transformedOptionDetails = optionDetails.map((option) => {
						return {
							...option,
							labelText: (
								<div className="flex items-center gap-2.5 text-sm text-[#374151] font-medium pl-1">
									{/* {option.icon && (
										<ODSIcon
											imageProps={{
												src: option.icon,
												className: "w-[18px] h-[18px] shrink-0 opacity-80",
											}}
										/>
									)} */}
									<span>{option.label}</span>
								</div>
							),
						};
					});

					updatedConfig = {
						...config,
						optionDetails: transformedOptionDetails,
					};
				}

				const Element = getField(type);
				if (!Element) return null;

				if (
					type === "radio" &&
					name === "stackingField" &&
					(!optionDetails || optionDetails.length === 0)
				) {
					return (
						<div key={name}>
							{label && <div className="text-[0.8125rem] font-semibold text-[#374151] tracking-[0.02em] mb-2.5">{label}</div>}
							{description && (
								<div className="text-sm text-[#6b7280] mb-3.5 leading-[1.6] font-normal">{description}</div>
							)}
							<div className="p-4 text-[#6b7280] text-sm text-center bg-[#f9fafb] rounded-lg border-[1.5px] border-dashed border-[#e5e7eb] leading-6">
								No SCQ fields available. You can add SCQ fields and configure stacking later.
							</div>
							<ErrorLabel errors={errors} name={name} />
						</div>
					);
				}

				return (
					<div key={name}>
						{label && type !== 'switch' && <div className="text-[0.8125rem] font-semibold text-[#374151] tracking-[0.02em] mb-2.5">{label}</div>}
						{description && (
							<div className="text-sm text-[#6b7280] mb-3.5 leading-[1.6] font-normal">{description}</div>
						)}
						{type === "radio" && optionDetails ? (
							<div className={styles.radio_list_container}>
								<Element
									{...updatedConfig}
									control={control}
									errors={errors}
									ref={(ele) => {
										if (ele && controlRef?.current) {
											controlRef.current[name] = ele;
										}
									}}
								/>
							</div>
						) : (
							<Element
								{...updatedConfig}
								control={control}
								errors={errors}
								ref={(ele) => {
									if (ele && controlRef?.current) {
										controlRef.current[name] = ele;
									}
								}}
							/>
						)}
						<ErrorLabel errors={errors} name={name} />
					</div>
				);
			})}
		</div>
	);
}

export default CreateViewModalBody;

