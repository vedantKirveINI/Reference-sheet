/** @jsxImportSource @emotion/react */
import React, { useEffect } from "react";
import { styled } from "@mui/material/styles";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { autocompleteClasses } from "@mui/material/Autocomplete";
import Popper from "@mui/material/Popper";
import { ODSAutocomplete as ODSAutoComplete, ODSCheckbox, ODSIcon as Icon } from "@src/module/ods";
import { ViewPort } from "@oute/oute-ds.core.constants";
import { styles } from "./styles";
import { AutocompleteTrigger } from "./triggerComponent";
import { FormControlLabel, Paper } from "@mui/material";

const StyledAutocompletePopper = styled("div")(({ theme }) => ({
  width: "100% !important",
  height: "85%",
  [`&.${autocompleteClasses.popperDisablePortal}`]: {
    position: "relative",
  },
  [`& .${autocompleteClasses.paper}`]: {
    boxShadow: "none",
    margin: 0,
    color: "inherit",
    height: "100%",
    border: "none",
  },
  [`& .${autocompleteClasses.listbox}`]: {
    backgroundColor: theme.palette.mode === "light" ? "#fff" : "#1c2128",
    height: "100%",
  },
}));

const StyledPopper = styled(Popper)(({ theme }) => ({
  zIndex: theme.zIndex.modal,
  fontSize: 13,
  width: "fit-content",
  minWidth: 50,
  maxWidth: 350,
  height: "fit-content",
  padding: 5,
  borderRadius: "12px",
  border: "0.75px solid rgba(0, 0, 0, 0.20)",
  background: "var(--Button-color, #FFF)",
  boxShadow: "0px 4px 8px 0px rgba(122, 124, 141, 0.20)",
  marginBottom: "10px !important",
  marginTop: "10px !important",
}));

const StyledPepper = styled("div")(({ theme }) => ({
  marginTop: "5px",
  marginLeft: "5px",
  width: "100%",
  borderRadius: "0.75em",
  label: {
    height: "20px",
    marginLeft: "0px",
    padding: "0.625em",
    fontSize: "0.9em",
    "& span": {
      fontSize: "unset !important",
    },
  },
  "&:hover": {
    background: "#DBEDFF",
  },
}));

type TDropdownProps = {
  value: any; //should be an array of objects with label and value or only array of values
  options: any;
  onChange: (value: any) => void;
  includeAll?: boolean;
  multiple: boolean;
  viewPort?: ViewPort;
  groupBy?: any;
  isSearchable?: boolean;
  showToolTip?: boolean;
  style?: {
    containerStyle?: any;
    labelStyle?: any;
    listStyle?: any;
    inputStyle?: any;
  };
};

type PopperComponentProps = {
  anchorEl?: any;
  disablePortal?: boolean;
  open: boolean;
  disableCloseOnSelect?: boolean;
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
    <Paper {...restPaperProps}>
      {includeAll && (
        <StyledPepper>
          <FormControlLabel
            onClick={(e) => {
              e.preventDefault(); // prevent blur
              handleSelectAll();
            }}
            label="Select all"
            control={
              <ODSCheckbox
                id="select-all-checkbox"
                style={{ marginRight: "0.75em" }}
                checked={selectAll}
              />
            }
          />
        </StyledPepper>
      )}
      {children}
    </Paper>
  );
}

const Dropdown = ({
  value,
  options,
  multiple,
  onChange,
  viewPort,
  isSearchable = true,
  groupBy,
  style = {},
  showToolTip = false,
  includeAll = false,
}: TDropdownProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectAll, setSelectAll] = React.useState(false);

  const open = Boolean(anchorEl);
  const id = open ? "autocomplete-label" : undefined;

  const handleClose = () => {
    if (anchorEl) {
      anchorEl.focus();
    }
    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      handleClose();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: any,
    reason: any
  ) => {
    if (reason === "clear" || reason === "removeOption") {
      setSelectAll(false);
    }
    if (reason === "selectOption" && data.length === options.length) {
      setSelectAll(true);
    }
    onChange(data);
    if (!multiple) {
      handleClose();
    }
  };

  const handleSelectAll = () => {
    const updatedValue = selectAll ? [] : [...options];
    setSelectAll(!selectAll);
    onChange(updatedValue);
  };

  useEffect(() => {
    if (value?.length === options?.length) {
      setSelectAll(true);
    }
  }, [value]);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (!id && !anchorEl) return;
      let element = document.getElementById(id);

      if (
        element &&
        !element.contains(event.target) &&
        anchorEl &&
        !anchorEl.contains(event.target)
      ) {
        handleClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id, anchorEl]);

  return (
    <>
      <div
        role="button"
        aria-description="autocomplete-trigger"
        onClick={handleClick}
        style={{ cursor: "pointer", width: "100%", ...style?.containerStyle }}
        data-testid="settings-autocomplete-trigger"
      >
        <AutocompleteTrigger
          defaultValue={value}
          isOpen={open}
          viewPort={viewPort}
          style={style?.labelStyle}
          multiple={multiple}
          onChange={onChange}
          showToolTip={showToolTip}
        />
      </div>
      <StyledPopper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement="top-start"
        sx={{
          "& .MuiAutocomplete-root": {
            display: !isSearchable && "none !important",
          },
          padding: !isSearchable ? "5px !important" : "16px !important",
        }}
        onClick={(event) => {
          // Stop propagation to prevent ClickAwayListener from closing the dropdown
          // when selecting an option in multiple selection mode.
          if (multiple) {
            event.stopPropagation();
          }
        }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <ODSAutoComplete
            open
            autoHighlight
            options={options}
            multiple={multiple}
            blurOnSelect={false}
            searchable={isSearchable}
            groupBy={groupBy}
            noOptionsText="No labels"
            data-testid="settings-autocomplete"
            value={value}
            slotProps={{
              paper: {
                sx: {
                  ...styles?.autocomplete?.paper(viewPort),
                },
              },
            }}
            ListboxProps={{
              sx: {
                ...styles?.autocomplete?.listbox(viewPort, style?.listStyle),
              },
              "data-testid": "settings-autocomplete-listbox",
            }}
            textFieldProps={{
              size: "small",
              InputProps: {
                "data-testid": "settings-autocomplete-input",
                startAdornment: isSearchable && (
                  <Icon
                    outeIconName="OUTESearchIcon"
                    outeIconProps={{
                      sx: {
                        height: "1.2em",
                        width: "1.2em",
                      },
                    }}
                  />
                ),
                endAdornment: null,
              },
            }}
            getOptionLabel={(option) => {
              if (Array.isArray(option) && option.length === 0) {
                return "";
              }
              return option?.label ? String(option?.label) : String(option);
            }}
            isOptionEqualToValue={(option, value) => {
              return option?.label
                ? option?.label === value?.label
                : option === value;
            }}
            onChange={handleChange}
            PopperComponent={PopperComponent}
            PaperComponent={(paperProps) =>
              paperComponent({
                paperProps,
                handleSelectAll,
                selectAll,
                includeAll,
              })
            }
            renderOption={(props, option, { selected, index }) => {
              return (
                <div
                  {...props}
                  key={`${option?.label ? option?.label : option}-${index}`}
                  css={styles.autocomplete.option}
                  data-testid="settings-autocomplete-option"
                >
                  {multiple && <ODSCheckbox checked={selected} />}
                  <span
                    css={{
                      ...styles.autocomplete.option.text({
                        flex: 1,
                      }),
                      wordBreak: "break-all",
                    }}
                  >
                    {option?.label ? option?.label : option}
                  </span>
                </div>
              );
            }}
          />
        </ClickAwayListener>
      </StyledPopper>
    </>
  );
};

export default Dropdown;
