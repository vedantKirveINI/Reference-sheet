import { Input } from "@/components/ui/input";
import { forwardRef, useImperativeHandle } from "react";

import getField from "@/common/forms/getField";
import ErrorLabel from "../../common/ErrorLabel";
import YES_NO_OPTIONS from "../../constants";
import useYesNoSettings from "../../hooks/useYesNoSettings";

const YesNoField = forwardRef(({ value = {}, controlErrorRef = {} }, ref) => {
	const { formHook = {}, controls = [] } = useYesNoSettings({
		value,
	});

	const {
		formState: { errors },
		control,
		handleSubmit,
	} = formHook;

	useImperativeHandle(ref, () => ({
		saveFormData() {
			return new Promise((resolve, reject) => {
				handleSubmit(
					(data) => {
						const { options, ...rest } = data;

						const transformedData = {
							...rest,
							defaultChoice: data?.defaultChoice?.label || "",
						};

						resolve(transformedData);
					},
					(error) => {
						reject(error);
					},
				)();
			});
		},
	}));

	return (
		<>
			<div className="flex flex-col w-full gap-3 pb-3">
				{YES_NO_OPTIONS.map((option) => {
					return (
						<Input
							key={option.id}
							value={option.label}
							disabled
						/>
					);
				})}
			</div>

			{controls.map((config) => {
				const { name, label, type } = config || {};
				const Element = getField(type);

				return (
					<div key={name} className="flex flex-col py-3 w-full box-border">
						{type !== "switch" && (
							<div className="m-0 mb-2 ml-2 text-xs">{label}</div>
						)}

						<Element
							{...config}
							control={control}
							ref={(ele) => {
								if (ele && controlErrorRef?.current) {
									controlErrorRef.current[name] = ele;
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

export default YesNoField;
