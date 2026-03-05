import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ODSChip = ({ 
  onDelete, 
  deleteIcon, 
  size = "medium", 
  className, 
  children, 
  label,
  variant = "filled",
  color = "default",
  onClick,
  ...props 
}) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(e);
    }
  };

  const colorStyles = {
    default: "bg-[var(--blue-gray-100)] text-[var(--blue-gray-800)]",
    primary: "bg-[var(--primary-100)] text-[var(--primary-800)]",
    secondary: "bg-[var(--blue-gray-200)] text-[var(--blue-gray-900)]",
    error: "bg-[var(--red-100)] text-[var(--red-800)]",
    warning: "bg-[var(--yellow-100)] text-[var(--yellow-800)]",
    info: "bg-[var(--primary-50)] text-[var(--primary-600)]",
    success: "bg-[var(--green-100)] text-[var(--green-800)]",
  };

  const outlinedColorStyles = {
    default: "border border-[var(--blue-gray-300)] text-[var(--blue-gray-700)] bg-transparent",
    primary: "border border-[var(--primary-300)] text-[var(--primary-600)] bg-transparent",
    secondary: "border border-[var(--blue-gray-400)] text-[var(--blue-gray-800)] bg-transparent",
    error: "border border-[var(--red-300)] text-[var(--red-600)] bg-transparent",
    warning: "border border-[var(--yellow-400)] text-[var(--yellow-700)] bg-transparent",
    info: "border border-[var(--primary-200)] text-[var(--primary-500)] bg-transparent",
    success: "border border-[var(--green-300)] text-[var(--green-700)] bg-transparent",
  };

  const variantStyles = variant === "outlined" ? outlinedColorStyles : colorStyles;

  const deleteIconSize = size === "small" ? "0.625rem" : "0.75rem";

  return (
    <span
      data-testid="ods-chip"
      className={cn(
        "inline-flex items-center rounded-full font-[Inter]",
        "px-[0.5rem] py-0",
        size === "small" && "text-[0.625rem] leading-[1.25rem]",
        size === "medium" && "text-[0.75rem] leading-[1.25rem]",
        variantStyles[color] || variantStyles.default,
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {label || children}
      {(onDelete || deleteIcon) && (
        <button
          type="button"
          onClick={handleDelete}
          className="ml-1 hover:opacity-70 flex items-center justify-center"
          data-testid="ods-chip-delete-icon"
        >
          {deleteIcon || (
            <X 
              style={{ width: deleteIconSize, height: deleteIconSize }} 
              className="text-[var(--blue-gray-500)]" 
            />
          )}
        </button>
      )}
    </span>
  );
};

export default ODSChip;
