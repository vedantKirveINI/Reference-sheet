import kebabCase from "lodash/kebabCase";
import { Input } from "@/components/ui/input";

function AddressContent({ controls = [], register = () => {}, errors = {} }) {
	return (
		<div className="flex flex-col w-full gap-[1.375rem]">
			{controls.map((config) => {
				const { name, type, rules, label, ...rest } = config;

				return (
					<div key={name} className="flex flex-col w-full">
						<p className="text-[var(--cell-text-primary-color)] font-[var(--tt-font-family)] text-[var(--cell-font-size)] tracking-[0.0156rem] ml-[0.625rem] mb-3">{label}</p>
						<Input
							{...rest}
							type={type}
							{...register(name, rules)}
							className="text-[#263238] text-base [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden"
							data-testid={`${kebabCase(name)}`}
						/>

						{errors?.[name] ? (
							<p className="m-0 ml-[0.375rem] text-[var(--cell-font-size)] text-red-500">
								{errors?.[name]?.message ||
									errors?.[name]?.type}
							</p>
						) : null}
					</div>
				);
			})}
		</div>
	);
}

export default AddressContent;
