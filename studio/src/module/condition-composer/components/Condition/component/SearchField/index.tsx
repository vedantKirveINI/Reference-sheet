import React, { useEffect, useRef, useState } from "react";
import { ODSTextField, ODSIcon } from "@src/module/ods";
import { debounce } from "lodash";
function SearchField({ placeholder = "", getFilterOptions }) {
  const [searchValue, setSearchValue] = useState("");

  const searchFieldRef = useRef(null);

  const debouncedGetFilteredOptions = debounce(() => {
    getFilterOptions(searchValue);
  }, 200);

  useEffect(() => {
    debouncedGetFilteredOptions();
  }, [searchValue]);

  return (
    <ODSTextField
      fullWidth
      className="black flex-1"
      data-testid="search-field"
      ref={searchFieldRef}
      placeholder={placeholder}
      value={searchValue}
      autoFocus={true}
      onChange={(e) => {
        setSearchValue(e.target.value);
      }}
      InputProps={{
        startAdornment: (
          <ODSIcon
            outeIconName="OUTESearchIcon"
            outeIconProps={{
              className: "h-5 w-5",
            }}
          />
        ),
        endAdornment: searchValue && (
          <ODSIcon
            outeIconName="OUTECloseIcon"
            outeIconProps={{
              className: "h-5 w-5 pointer-events-auto cursor-pointer",
            }}
            buttonProps={{
              className: "p-0",
            }}
            onClick={() => {
              setSearchValue("");
              setTimeout(() => {
                searchFieldRef.current.focus();
              }, 0);
            }}
          />
        ),
      }}
    />
  );
}

export default SearchField;
