import TextEllipses from "../../../assets/table-sub-header-icons/text_ellipses.svg";
import TextWrapIcon from "../../../assets/table-sub-header-icons/text_wrap.svg";

const TEXT_WRAP_OPTIONS = [
	{ label: "Ellipses Text", value: "ellipses" },
	{ label: "Wrap Text", value: "wrap" },
];

const TEXT_WRAP_ICON_MAPPING = {
	wrap: TextWrapIcon,
	ellipses: TextEllipses,
};

export { TEXT_WRAP_OPTIONS, TEXT_WRAP_ICON_MAPPING };
