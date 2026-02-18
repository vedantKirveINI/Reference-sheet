import React, { useState, useEffect, useRef, useCallback } from "react";
import { CellType } from "@/types";

export interface IAddColumnPopoverProps {
        isOpen: boolean;
        onClose: () => void;
        onConfirm: (name: string, type: CellType) => void;
        position: { x: number; y: number };
}

const CELL_TYPE_OPTIONS: Array<{ value: CellType; label: string }> = [
        { value: CellType.String, label: "Text" },
        { value: CellType.Number, label: "Number" },
        { value: CellType.MCQ, label: "Multiple Choice" },
        { value: CellType.PhoneNumber, label: "Phone Number" },
        { value: CellType.Currency, label: "Currency" },
        { value: CellType.ZipCode, label: "Zip Code" },
];

export const AddColumnPopover: React.FC<IAddColumnPopoverProps> = ({
        isOpen,
        onClose,
        onConfirm,
        position,
}) => {
        const [columnName, setColumnName] = useState("");
        const [columnType, setColumnType] = useState<CellType>(CellType.String);
        const nameInputRef = useRef<HTMLInputElement>(null);
        const popoverRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
                if (isOpen && nameInputRef.current) {
                        setTimeout(() => {
                                nameInputRef.current?.focus();
                                nameInputRef.current?.select();
                        }, 0);
                } else if (!isOpen) {
                        setColumnName("");
                        setColumnType(CellType.String);
                }
        }, [isOpen]);

        useEffect(() => {
                if (!isOpen) return;

                const handleEscape = (e: KeyboardEvent) => {
                        if (e.key === "Escape") {
                                onClose();
                        }
                };

                document.addEventListener("keydown", handleEscape);
                return () => document.removeEventListener("keydown", handleEscape);
        }, [isOpen, onClose]);

        useEffect(() => {
                if (!isOpen) return;

                const handleClickOutside = (e: MouseEvent) => {
                        if (
                                popoverRef.current &&
                                !popoverRef.current.contains(e.target as Node)
                        ) {
                                onClose();
                        }
                };

                document.addEventListener("mousedown", handleClickOutside, true);
                return () =>
                        document.removeEventListener("mousedown", handleClickOutside, true);
        }, [isOpen, onClose]);

        const handleKeyDown = useCallback(
                (e: React.KeyboardEvent) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                        }
                },
                [columnName, columnType],
        );

        const handleSubmit = useCallback(() => {
                if (!columnName.trim()) {
                        const defaultName = `Column ${Date.now()}`;
                        onConfirm(defaultName, columnType);
                } else {
                        onConfirm(columnName.trim(), columnType);
                }
                onClose();
        }, [columnName, columnType, onConfirm, onClose]);

        if (!isOpen) {
                return null;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const popoverWidth = 320;
        const popoverHeight = 200;

        let popoverX = position.x;
        let popoverY = position.y + 10;

        if (popoverX + popoverWidth > viewportWidth) {
                popoverX = viewportWidth - popoverWidth - 10;
        }
        if (popoverX < 10) {
                popoverX = 10;
        }
        if (popoverY + popoverHeight > viewportHeight) {
                popoverY = position.y - popoverHeight - 10;
        }
        if (popoverY < 10) {
                popoverY = 10;
        }

        return (
                <div
                        ref={popoverRef}
                        className="bg-white border border-[#e0e0e0] rounded-lg shadow-lg min-w-[320px] max-w-[400px] flex flex-col"
                        style={{
                                position: "fixed",
                                left: `${popoverX}px`,
                                top: `${popoverY}px`,
                                zIndex: 10000,
                        }}
                >
                        <div className="px-4 py-3 border-b border-[#e0e0e0]">
                                <h3 className="text-sm font-semibold text-[#263238] m-0">Add Column</h3>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                                <div className="flex flex-col gap-1.5">
                                        <label htmlFor="column-name" className="text-xs font-medium text-[#546e7a]">
                                                Column Name
                                        </label>
                                        <input
                                                ref={nameInputRef}
                                                id="column-name"
                                                type="text"
                                                className="w-full px-3 py-2 border border-[#e0e0e0] rounded text-sm outline-none focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2] transition-colors"
                                                value={columnName}
                                                onChange={(e) => setColumnName(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Enter column name..."
                                        />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                        <label htmlFor="column-type" className="text-xs font-medium text-[#546e7a]">
                                                Column Type
                                        </label>
                                        <select
                                                id="column-type"
                                                className="w-full px-3 py-2 border border-[#e0e0e0] rounded text-sm outline-none cursor-pointer focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2] transition-colors"
                                                value={columnType}
                                                onChange={(e) =>
                                                        setColumnType(e.target.value as CellType)
                                                }
                                                onKeyDown={handleKeyDown}
                                        >
                                                {CELL_TYPE_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                                {option.label}
                                                        </option>
                                                ))}
                                        </select>
                                </div>
                        </div>
                        <div className="px-4 py-3 border-t border-[#e0e0e0] flex justify-end gap-2">
                                <button
                                        type="button"
                                        className="px-4 py-2 border border-[#d0d0d0] rounded text-[13px] font-medium cursor-pointer transition-all duration-200 bg-white text-[#666] hover:bg-[#f5f5f5] hover:border-[#b0b0b0]"
                                        onClick={onClose}
                                >
                                        Cancel
                                </button>
                                <button
                                        type="button"
                                        className="px-4 py-2 border border-[#4a90e2] rounded text-[13px] font-medium cursor-pointer transition-all duration-200 bg-[#4a90e2] text-white hover:bg-[#357abd] hover:border-[#357abd] active:bg-[#2a5f8f]"
                                        onClick={handleSubmit}
                                >
                                        Add Column
                                </button>
                        </div>
                </div>
        );
};
