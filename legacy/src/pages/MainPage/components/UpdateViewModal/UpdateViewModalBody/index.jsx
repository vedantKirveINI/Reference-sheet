import React from "react";
import getField from "@/common/forms/getField";
import ErrorLabel from "@/components/FieldModalOptions/common/ErrorLabel";

function UpdateViewModalBody({
	controls = [],
	control,
	errors = {},
}) {
	return (
		<div className="flex flex-col gap-5 py-5 px-6">
			{controls.map((config) => {
				const { name, label, type, description, optionDetails } = config || {};
				
				let updatedConfig = config;
				if (type === "radio" && optionDetails && name === "stackingField") {
					const transformedOptionDetails = optionDetails.map((option) => {
						return {
							...option,
							labelText: (
								<div className="flex items-center gap-2.5 text-sm text-[#374151] font-medium pl-1">
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
								No SCQ fields available. You can add SCQ fields and configure
								stacking later.
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
							<div className="max-h-60 overflow-y-auto py-1 [&_:is(:global(.MuiFormControlLabel-root),:global(label:has([role='radio'])))]:flex [&_:is(:global(.MuiFormControlLabel-root),:global(label:has([role='radio'])))]:items-center [&_:is(:global(.MuiFormControlLabel-root),:global(label:has([role='radio'])))]:min-h-9 [&_:is(:global(.MuiFormControlLabel-root),:global(label:has([role='radio'])))]:pl-3 [&_:is(:global(.MuiFormControlLabel-root),:global(label:has([role='radio'])))]:mb-1 [&_:is(:global(.MuiFormControlLabel-root),:global(label:has([role='radio'])))]:border-l-4 [&_:is(:global(.MuiFormControlLabel-root),:global(label:has([role='radio'])))]:border-l-[#e2e8f0] [&_:is(:global(.MuiFormControlLabel-root),:global(label:has([role='radio'])))]:rounded-tl [&_:is(:global(.MuiFormControlLabel-root),:global(label:has([role='radio'])))]:rounded-bl [&_:is(:global(.MuiFormControlLabel-root),:global(label:has([role='radio'])))]:rounded-tr-md [&_:is(:global(.MuiFormControlLabel-root),:global(label:has([role='radio'])))]:rounded-br-md [&_:is(:global(.MuiFormControlLabel-root):has(.Mui-checked),:global(label:has([aria-checked='true'])))]:border-l-[#3b82f6]">
								<Element
									{...updatedConfig}
									control={control}
									errors={errors}
								/>
							</div>
						) : (
							<Element
								{...updatedConfig}
								control={control}
								errors={errors}
							/>
						)}
						<ErrorLabel errors={errors} name={name} />
					</div>
				);
			})}
		</div>
	);
}

export default UpdateViewModalBody;
