import { ODSPopper as Popper, ODSLabel } from "@src/module/ods";
import { ClickAwayListener } from "@src/module/utils/hooks";
import { ForwardedRef, forwardRef } from "react";
// import SearchIcon from "../asset/search.svg";
import { Styles } from "./styles";
type SearchPopperProps = {
  searchRef: any;
  searchOptions?: any;
  setShowSearchPopper?: any;
  showSearchPopper?: boolean;
  onChange?: any;
  setActiveLevelIndex?: any;
};

export const SearchPopper = forwardRef<HTMLDivElement, SearchPopperProps>(
  ({
    searchRef,
    searchOptions,
    showSearchPopper,
    setShowSearchPopper,
    onChange,
    setActiveLevelIndex,
  }, ref) => {
    const handleClickAway = () => {
      if (setShowSearchPopper) setShowSearchPopper(false);
      setActiveLevelIndex(null);
    };
    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <Popper
          open={showSearchPopper}
          anchorEl={searchRef.current}
          placement="bottom-start"
          style={Styles.popperRootStyle}
        >
          <div ref={ref} style={Styles.wrapperContainerStyle}>
            <div style={Styles.listContainerStyle}>
              {searchOptions?.length === 0 && (
                <div style={Styles.noItemsFoundStyle}>No items found</div>
              )}
              {searchOptions?.length > 0 &&
                searchOptions?.map((option: any) => {
                  return (
                    <ODSLabel
                      key={option?.id}
                      variant="body1"
                      onClick={() => {
                        onChange(option);
                        setShowSearchPopper(false);
                      }}
                      style={Styles.optionStyle}
                    >
                      {option.label}
                    </ODSLabel>
                  );
                })}
            </div>
          </div>
        </Popper>
      </ClickAwayListener>
    );
  }
);
