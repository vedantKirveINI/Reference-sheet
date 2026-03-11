import React from "react";
import { ClickAwayListener } from "@src/module/utils/hooks";
import { ODSPopper as Popper } from "@src/module/ods";
import { TCountryDetails } from "@oute/oute-ds.core.constants/countries-list";
import { countries, ViewPort } from "@oute/oute-ds.core.constants";
import { ODSAutocomplete as ODSAutoComplete } from "@src/module/ods";
import { ODSCheckbox } from "@src/module/ods";
import { styles } from "./styles";
import SearchIcon from "./assets/searchIcon";
import DropdownIcon from "./assets/dropdownIcon";
type TCountryPickerProps = {
  value: any;
  onChange: (value: TCountryDetails | string[] | any) => void;
  multiple: boolean;
  triggerComponent: React.JSX.Element | React.ReactNode;
  viewPort: ViewPort;
  includeAll?: any;
  showCountryNumber?: boolean;
  style?: {
    popperStyle?: object;
    paperStyle?: object;
    listboxStyle?: object;
    inputStyle?: object;
    optionStyle?: object;
  };
};

// Custom Popper props type (replacing MUI PopperProps)
interface CustomPopperProps {
  anchorEl?: HTMLElement | null;
  disablePortal?: boolean;
  open: boolean;
  placement?: "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end" | "left-start" | "left" | "left-end" | "right-start" | "right" | "right-end";
  popperStyle?: object;
  id?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

type PopperComponentProps = {
  anchorEl?: any;
  disablePortal?: boolean;
  open: boolean;
  disableCloseOnSelect?: boolean;
};

// StyledAutocompletePopper as regular component with inline styles
const StyledAutocompletePopper = ({ children, ...other }: { children: React.ReactNode; [key: string]: any }) => {
  const popperStyles: React.CSSProperties = {
    height: "85%",
    position: "relative",
  };

  const paperStyles: React.CSSProperties = {
    boxShadow: "none",
    margin: 0,
    color: "inherit",
    height: "100%",
    border: "none",
  };

  const listboxStyles: React.CSSProperties = {
    backgroundColor: "#fff", // Default to light mode
    height: "100%",
  };

  return (
    <div style={popperStyles} {...other}>
      <div style={paperStyles}>
        <div style={listboxStyles}>
          {children}
        </div>
      </div>
    </div>
  );
};

// StyledPopper component using ODSPopper with inline styles
const StyledPopper = ({ 
  popperStyle, 
  open, 
  anchorEl, 
  placement,
  children,
  ...other 
}: CustomPopperProps & { children: React.ReactNode }) => {
  const popperStyles: React.CSSProperties = {
    zIndex: 1300, // theme.zIndex.modal equivalent
    fontSize: 13,
    width: 398,
    padding: 16,
    borderRadius: "12px",
    border: "0.75px solid rgba(0, 0, 0, 0.20)",
    background: "var(--Button-color, #FFF)",
    boxShadow: "0px 4px 8px 0px rgba(122, 124, 141, 0.20)",
    marginBottom: "10px",
    marginTop: "10px",
    ...popperStyle,
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement={placement}
      style={popperStyles}
      {...other}
    >
      {children}
    </Popper>
  );
};

// StyledPepper as regular component with inline styles
const StyledPepper = ({ children, ...other }: { children: React.ReactNode; [key: string]: any }) => {
  const containerStyles: React.CSSProperties = {
    marginTop: "5px",
    width: "100%",
    borderRadius: "0.75em",
  };

  const labelStyles: React.CSSProperties = {
    width: "100%",
    height: "20px",
    marginLeft: "0px",
    padding: "0.625em",
  };

  return (
    <div 
      style={containerStyles} 
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#DBEDFF";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
      {...other}
    >
      <div style={labelStyles}>
        {children}
      </div>
    </div>
  );
};

function PopperComponent(props: PopperComponentProps) {
  const { disablePortal, anchorEl, open, disableCloseOnSelect, ...other } =
    props;
  return <StyledAutocompletePopper {...other} />;
}

function paperComponent(props: any) {
  const { paperProps, handleSelectAll, selectAll, includeAll } = props;
  const { children, ...restPaperProps } = paperProps;
  return (
    <div {...restPaperProps}>
      {includeAll && (
        <StyledPepper>
          <div
            onClick={(e) => {
              e.preventDefault(); // prevent blur
              handleSelectAll();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              width: "100%",
            }}
          >
            <ODSCheckbox
              id="select-all-checkbox"
              style={{ marginRight: "0.75em" }}
              checked={selectAll}
            />
            <label
              htmlFor="select-all-checkbox"
              style={{
                cursor: "pointer",
                userSelect: "none",
                flex: 1,
              }}
            >
              Select all
            </label>
          </div>
        </StyledPepper>
      )}
      {children}
    </div>
  );
}

const AutocompleteTrigger = ({
  countryCode,
}: {
  countryCode: string;
}): React.JSX.Element => {
  return (
    <div
      role="button"
      aria-description="autocomplete-trigger"
      style={styles.autocompleteTriggerContainer(false)}
    >
      <div style={styles.wrapperContainer}>
        <img
          loading="lazy"
          width="20"
          height="15"
          srcSet={`https://ccc.oute.app/country-flags/${countryCode}.svg 2x`}
          src={`https://ccc.oute.app/country-flags/${countryCode}.svg`}
          alt=""
          style={{ marginRight: "0.5em" }}
        />
        <span style={styles.text()}>{countries[countryCode]?.countryName}</span>
      </div>
      <DropdownIcon
        width={24}
        height={24}
        style={{ transform: "rotate(180deg)" }}
      />
    </div>
  );
};

export const CountryPicker = ({
  value,
  multiple,
  onChange,
  triggerComponent,
  includeAll = false,
  showCountryNumber = true,
  style = {
    popperStyle: {},
    paperStyle: {},
    listboxStyle: {},
    inputStyle: {},
    optionStyle: {},
  },
}: TCountryPickerProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectAll, setSelectAll] = React.useState(false);

  const options = Object.values(countries);
  const open = Boolean(anchorEl);
  const id = open ? "autocomplete-label" : undefined;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSelectAll = () => {
    setSelectAll((prev) => {
      if (!prev) onChange([...options]);
      else onChange([]);
      return !prev;
    });
  };

  const handleOnChange = (_e, _value, reason) => {
    if (reason === "clear" || reason === "removeOption") setSelectAll(false);
    if (reason === "selectOption" && _value.length === options.length)
      setSelectAll(true);
    onChange(_value);
  };

  const handleClose = () => {
    if (anchorEl) {
      anchorEl.focus();
    }
    setAnchorEl(null);
  };

  return (
    <>
      <div
        role="button"
        aria-description="autocomplete-trigger"
        onClick={handleClick}
        style={{ cursor: "pointer", width: "100%" }}
      >
        {triggerComponent ? (
          triggerComponent
        ) : (
          <AutocompleteTrigger countryCode={value?.countryCode} />
        )}
      </div>
      <StyledPopper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement="top-start"
        popperStyle={style?.popperStyle}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <ODSAutoComplete
            searchable
            options={options}
            value={value}
            textFieldProps={{
              size: "small",
              placeholder: "Search countries...",
              autoFocus: true,
            }}
            getOptionLabel={(option: TCountryDetails) =>
              option?.countryName || countries[option?.countryCode]?.countryName
            }
            onChange={handleOnChange}
            className="country-picker-autocomplete"
            style={{
              ...styles?.paper(style?.paperStyle),
            }}
          />
        </ClickAwayListener>
      </StyledPopper>
    </>
  );
};
