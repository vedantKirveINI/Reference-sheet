import React from "react";

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

	const processChildren = (children) => {
		return React.Children.map(children, (child) => {
			if (!React.isValidElement(child)) return child;

			if (child.props["data-testid"] === "draggable-element") {
				if (fieldsLength <= 1) {
					return null;
				}

				return (
					<div
						{...(isDraggable && listeners)}
						{...(isDraggable && attributes)}
						tabIndex={-1}
						className="cursor-grab"
						style={child.props.style || {}}
					>
						{child}
					</div>
				);
			} else if (child.props["data-testid"] === "delete-element") {
				if (fieldsLength <= 1) {
					return null;
				}

				return (
					<div
						tabIndex={0}
						onClick={() => remove(fieldIndex)}
						className="cursor-pointer"
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								remove(fieldIndex);
							}
						}}
					>
						{child}
					</div>
				);
			}

			const updatedChildren = child.props.children
				? processChildren(child.props.children)
				: child.props.children;

			return <child.type {...child.props}>{updatedChildren}</child.type>;
		});
	};

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
