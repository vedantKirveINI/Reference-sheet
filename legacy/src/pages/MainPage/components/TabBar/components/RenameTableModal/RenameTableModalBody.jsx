import getField from "@/common/forms/getField";
import ErrorLabel from "@/components/FieldModalOptions/common/ErrorLabel";

function RenameTableModalBody({
	controls = [],
	control,
	errors = {},
	controlRef = null,
}) {
	return (
		<div className="p-2 flex flex-col gap-4 max-[600px]:p-4">
			{controls.map((config) => {
				const { name, label, type } = config || {};
				const Element = getField(type);

				return (
					<div className="w-full flex flex-col gap-1.5" key={name}>
						<div className="text-sm font-medium text-[#212121] font-[Inter,sans-serif]">{label}</div>
						<Element
							{...config}
							control={control}
							errors={errors}
							ref={(ele) => {
								if (ele && controlRef?.current) {
									controlRef.current[name] = ele;
								}
							}}
						/>
						<ErrorLabel errors={errors} name={name} />
					</div>
				);
			})}
		</div>
	);
}

export default RenameTableModalBody;
