import React, {
	useRef,
	useState,
	useImperativeHandle,
	forwardRef,
} from "react";
import type { IRatingCell } from "@/types";
import type { IEditorRef, IEditorProps } from "@/types";

interface RatingEditorProps extends IEditorProps {
	cell: IRatingCell;
}

const RatingEditorBase = forwardRef<IEditorRef, RatingEditorProps>(
	({ cell, onChange, onSave, onCancel }, ref) => {
		const focusRef = useRef<HTMLInputElement>(null);
		const [value, setValue] = useState<number | null>(cell.data);
		const [lastTime, setLastTime] = useState(0);

		useImperativeHandle(ref, () => ({
			focus: () => focusRef.current?.focus(),
			blur: () => focusRef.current?.blur(),
			getValue: () => value,
			setValue: (v: unknown) => {
				if (typeof v === "number") {
					setValue(v);
				}
			},
		}));

		const isNumberKey = (keyCode: number): boolean => {
			return (
				(keyCode >= 48 && keyCode <= 57) ||
				(keyCode >= 96 && keyCode <= 105)
			);
		};

		const handleKeyDown = (e: React.KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey) return;

			if (isNumberKey(e.keyCode)) {
				e.preventDefault();
				const currentTime = Date.now();
				const maxRating = cell.options?.maxRating ?? 10;
				let newValue: number | null = Number(e.key);

				if (
					value === 1 &&
					newValue === 0 &&
					currentTime - lastTime <= 500
				) {
					newValue = 10;
				} else {
					newValue =
						newValue === value ||
						newValue === 0 ||
						Number.isNaN(newValue)
							? null
							: Math.min(newValue, maxRating);
				}

				setValue(newValue);
				onChange?.(newValue);
				setLastTime(currentTime);
			} else if (e.key === "Enter" || e.key === "Tab") {
				e.preventDefault();
				onSave?.();
			} else if (e.key === "Escape") {
				e.preventDefault();
				onCancel?.();
			}
		};

		return (
			<div onKeyDown={handleKeyDown} className="w-0 h-0">
				<input
					ref={focusRef}
					className="w-0 h-0 border-none p-0 shadow-none outline-none"
					autoFocus
				/>
			</div>
		);
	},
);

RatingEditorBase.displayName = "RatingEditor";

export const RatingEditor = RatingEditorBase;
