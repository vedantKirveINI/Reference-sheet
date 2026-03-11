import React from "react";

import styles from "./styles.module.scss";

function RenderItem({
	element = {},
	isDraggable = true,
	listeners = {},
	attributes = {},
	remove = () => {},
	fieldIndex = 0,
	fieldsLength = 0,
}) {
	if (!React.isValidElement(element)) return element;

	// Process multiple children if `element.props.children` is an array
	const processChildren = (children) => {
		return React.Children.map(children, (child) => {
			if (!React.isValidElement(child)) return child; // Ignore non-elements

			// If child has `data-testid="draggable-element"`, attach listeners
			// Only make it draggable if there's more than one field and isDraggable is true
			if (child.props["data-testid"] === "draggable-element") {
				// Only show drag handle if there's more than one field
				if (fieldsLength <= 1) {
					return null; // Don't render drag handle for single field
				}

				return (
					<div
						{...(isDraggable && listeners)}
						{...(isDraggable && attributes)}
						tabIndex={-1} // Prevents focus via Tab key
						style={{
							...(child.props.style || {}),
							cursor: "grab",
						}}
					>
						{child}
					</div>
				);
			} else if (child.props["data-testid"] === "delete-element") {
				// Only show delete button if there's more than one field
				if (fieldsLength <= 1) {
					return null; // Don't render delete button for single field
				}

				return (
					<div
						tabIndex={0}
						onClick={() => remove(fieldIndex)}
						className={styles.remove_icon}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault(); // Prevent default behavior
								remove(fieldIndex); // Trigger remove on Enter
							}
						}}
					>
						{child}
					</div>
				);
			}

			// Recursively process children (if any) while keeping the element unchanged
			const updatedChildren = child.props.children
				? processChildren(child.props.children)
				: child.props.children;

			return <child.type {...child.props}>{updatedChildren}</child.type>;
		});
	};

	// Check if `element` itself is an array or a single element
	return Array.isArray(element)
		? element.map((el) =>
				RenderItem({
					element: el,
					isDraggable,
					listeners,
					attributes,
					remove,
					fieldIndex,
					fieldsLength,
				}),
			)
		: processChildren(element);
}

export default RenderItem;
