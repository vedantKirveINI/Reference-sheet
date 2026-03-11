import isEmpty from "lodash/isEmpty";
import { FormulaBar } from "oute-ds-formula-bar";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { useForm } from "react-hook-form";

import InputController from "../../../../../form/Controller/InputController";
import onHelpClick from "../../../utils/onHelpClick";
import ErrorLabel from "../../FieldModalOptions/common/ErrorLabel";

import Example from "./Example";
import styles from "./styles.module.scss";

const FormulaField = forwardRef(({ fields = [], value = {} }, ref) => {
	const fxRef = useRef(null);
	const blocks = value?.computedFieldMeta?.expression?.blocks || [];

	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
		setError,
		clearErrors,
	} = useForm({
		defaultValues: {
			formula: blocks,
			description: value?.description || "",
		},
		mode: "onSubmit",
	});

	useImperativeHandle(ref, () => ({
		saveFormData() {
			return new Promise((resolve, reject) => {
				// Clear any existing errors first
				clearErrors();

				// Check if formula is empty
				if (isEmpty(formula)) {
					setError("formula", {
						type: "required",
						message: "Formula is required",
					});
				}

				handleSubmit(
					(data) => {
						resolve(data);
					},
					(error) => reject(error),
				)();
			});
		},
	}));

	function onInputContentChanged(content, contentStr) {
		setValue("formula", content);
		// Clear formula error when user starts typing
		if (content) {
			clearErrors("formula");
		}
	}

	const formula = watch("formula");

	return (
		<div>
			<div className={styles.label}>
				<span>Describe your formula *</span>
				<span
					className={styles.learn_more_container}
					onClick={onHelpClick}
				>
					Learn more
				</span>
			</div>
			<div>
				<FormulaBar
					ref={fxRef}
					displayFunctionsFor="tables"
					tableColumns={fields}
					defaultInputContent={blocks}
					placeholder="Enter expression"
					onInputContentChanged={onInputContentChanged}
					wrapContent={true}
					slotProps={{
						container: {
							style: {
								height: "10rem",
								overflow: "auto",
								width: "100%",
							},
							"data-testid": "transformer-fx-container",
						},
					}}
				/>
				<ErrorLabel errors={errors} name="formula" />
			</div>
			<Example />
			<div className={styles.label}>Description</div>
			<InputController
				className="black"
				placeholder="Enter description"
				control={control}
				name="description"
				sx={{
					width: "100%",
				}}
			/>
		</div>
	);
});

export default FormulaField;
