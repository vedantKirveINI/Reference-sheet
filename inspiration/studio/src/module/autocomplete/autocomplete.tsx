import React, { useCallback, useRef } from "react";
import { ODSTextField as TextField } from "@src/module/ods";
import { SearchPopper } from "./components/search-popper";
import * as curlCovertor from "oute-services-utility-sdk";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";
import { debounce, isEmpty } from "lodash";
import { getFetchedData } from "./utils/get-fetched-data";

export interface AutoCompleteProps {
  isCreator?: boolean;
  value?: any;
  onChange?: ({}) => void;
  settings?: any;
  theme?: any;
  autoFocus?: boolean;
  answers?: any;
}

export const Autocomplete = ({
  isCreator,
  value,
  onChange,
  settings,
  theme,
  autoFocus = false,
  answers,
}: AutoCompleteProps) => {
  const [error, setError] = React.useState(false);
  const [showSearchPopper, setShowSearchPopper] = React.useState(false);
  const [searchOptions, setSearchOptions] = React.useState([]);
  const searchRef = useRef(null);
  let curlCommand = settings?.curlCommand;

  let label = settings?.label;
  let id = settings?.id;

  const isInputDisabled =
    isCreator || !label || !id || isEmpty(curlCommand.blocks);

  const resolveFx = ({ answers }: any) => {
    const res = OuteServicesFlowUtility?.resolveValue(
      answers,
      "",
      curlCommand,
      null
    );
    return res?.value;
  };

  const handleOnChange = (e: any, _value: string) => {
    onChange({ searchString: _value });
    if (_value?.length > 2) {
      setShowSearchPopper(true);
      const curlCommand = resolveFx({ answers });
      let curlJson = curlCovertor.curlToJson(curlCommand);
      debouncedApiCall(curlJson);
    } else {
      setShowSearchPopper(false);
    }
  };

  const debouncedApiCall = useCallback(
    debounce(async (curlJson) => {
      try {
        const fetchedData = await getFetchedData({ curlJson, settings });
        // const filteredData = fetchedData.filter((item) =>
        //   item?.label?.toLowerCase()?.includes(value?.toLowerCase())
        // );
        // setSearchOptions(filteredData);
        setSearchOptions(fetchedData);
        setError(false);
      } catch (error) {
        setError(true);
      }
    }, 500),
    []
  );

  return (
    <div style={{ position: "relative" }}>
      <TextField
        ref={searchRef}
        name="autocomplete"
        type="text"
        placeholder="Search"
        value={value?.searchString}
        onChange={(e, _value) => handleOnChange(e, _value)}
        onBlur={() => setShowSearchPopper(false)}
        theme={theme}
        isDisabled={isInputDisabled}
        testId="autocomplete-text-field"
        autoFocus={autoFocus}
      />
      {showSearchPopper && !error && (
        <SearchPopper
          searchRef={searchRef}
          showSearchPopper={showSearchPopper}
          setShowSearchPopper={setShowSearchPopper}
          searchTerm={value?.searchString}
          searchOptions={searchOptions}
          onChange={onChange}
        />
      )}
    </div>
  );
};
