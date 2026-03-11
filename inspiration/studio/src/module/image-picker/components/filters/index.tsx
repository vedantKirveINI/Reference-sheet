import { forwardRef, useCallback, useEffect, useState } from "react";
import { ODSIcon } from "@src/module/ods";
import { ODSTextField } from "@src/module/ods";
import debounce from "lodash/debounce";
import { getInitialQuery } from "../../utils/getInitialQuery";
const Filters = forwardRef(
  ({ isLoadingQuestionType, initialSearchQuery, imageRef }: any, ref) => {
    const [searchQuery, setSearchQuery] = useState("");

    const debouncedGetImages = useCallback(
      debounce((query) => {
        if (imageRef.current && !!query) {
          imageRef.current.getImages(query, 1);
        }
      }, 1000),
      []
    );

    useEffect(() => {
      if (imageRef.current && !searchQuery) {
        imageRef.current.getImages(
          getInitialQuery({ initialSearchQuery, isLoadingQuestionType }),
          1
        );
      }
    }, [searchQuery]);

    return (
      <ODSTextField
        fullWidth={true}
        placeholder="Search for Images"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          debouncedGetImages(e.target.value);
        }}
        InputProps={{
          startAdornment: (
            <ODSIcon
              outeIconName="OUTESearchIcon"
              outeIconProps={{
                "data-testid": "image-picker-search-icon",
              }}
            />
          ),
        }}
        inputProps={{
          "data-testid": "image-picker-search-input-field",
        }}
        style={{
          // Focus border styling handled by component
        }}
        data-testid="image-picker-search-input"
      />
    );
  }
);

export default Filters;
