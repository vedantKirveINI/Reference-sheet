import { ODSPopper as Popper, ODSLabel } from "@src/module/ods";
import { ClickAwayListener } from "@src/module/utils/hooks";
import { forwardRef } from "react";
import { Styles } from "./styles";
type SearchPopperProps = {
  searchRef: any;
  searchTerm: string;
  searchOptions?: any;
  setShowSearchPopper?: any;
  showSearchPopper?: boolean;
  onChange?: any;
};

export const SearchPopper = forwardRef<HTMLDivElement, SearchPopperProps>(
  (
    {
      searchRef,
      searchTerm,
      searchOptions,
      showSearchPopper,
      setShowSearchPopper,
      onChange,
    },
    ref
  ) => {
    const handleClickAway = () => {
      if (setShowSearchPopper) setShowSearchPopper(false);
    };
    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <Popper
          open={showSearchPopper}
          anchorEl={searchRef.current}
          placement="bottom-start"
          style={Styles.popperRootStyle}
          data-testid="autocomplete-search-popper"
        >
          <div ref={ref} style={Styles.listContainerStyle} data-testid="autocomplete-list">
            {searchTerm.length > 2 && searchOptions?.length === 0 && (
              <div
                style={Styles.noItemsFoundStyle}
                data-testid="autocomplete-no-items-found"
              >
                No items found
              </div>
            )}
            {searchOptions?.length > 0 &&
              searchOptions?.map((option: any) => {
                return (
                  <ODSLabel
                    key={option?.id}
                    variant="body1"
                    onClick={() => {
                      onChange({
                        searchString: option.label,
                        ...option,
                      });
                      setShowSearchPopper(false);
                    }}
                    style={Styles.optionStyle}
                    data-testid="autocomplete-option"
                  >
                    {option.label}
                  </ODSLabel>
                );
              })}
          </div>
        </Popper>
      </ClickAwayListener>
    );
  }
);
