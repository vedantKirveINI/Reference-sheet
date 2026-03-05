import React, { useRef, useState } from "react";
import { SearchPopper } from "./components/searchPopper/search-popper";
import { get, isEmpty } from "lodash";
import Tile from "./components/tile";
import AddButton from "./components/addButton";
import { styles } from "./styles";
import * as curlCovertor from "oute-services-utility-sdk";

export type CloudFileExplorerProps = {
  initialDataCurl: any;
  nextDataCurl: any;
  optionsPath?: any;
  onChange?: any;
};

export const CloudFileExplorer = ({
  initialDataCurl,
  nextDataCurl,
  optionsPath,
  onChange,
}: CloudFileExplorerProps) => {
  const selectionType = "json";
  const searchRef = useRef();
  const [showSearchPopper, setShowSearchPopper] = React.useState(false);

  const [error, setError] = useState("");
  const [levels, setLevels] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [activeLevelIndex, setActiveLevelIndex] = useState(null);

  const [value, setValue] = useState();
  // { id: "", label: "", levels: [] }
  const onSelect = (opt) => {
    if (opt?.name?.includes(selectionType)) {
      setValue(opt);
      onChange(opt);
    }

    let levelsTemp = [...levels];
    if (levelsTemp[activeLevelIndex]) {
    } else {
      levelsTemp = [
        ...levelsTemp,
        {
          id: opt?.id,
          name: opt?.label,
        },
      ];
    }
    setLevels(levelsTemp);
    setActiveLevelIndex(null);
  };

  const getInitialData = async (index) => {
    try {
      let curlJson = curlCovertor.curlToJson(initialDataCurl);
      let url = curlJson?.url;
      const queryString = new URLSearchParams(
        curlJson?.query_params
      ).toString();
      url = queryString ? `${url}?${queryString}` : url;
      let res = (await fetch(url, {
        method: "GET",
        headers: curlJson?.headers,
      })) as any;

      if (res?.status !== 200) {
        throw res;
      }
      res = await res?.json();

      let options = res.value;
      options = optionsPath ? eval(`res.${optionsPath}`) : options;

      const newOptions = options?.map((opt) => {
        return {
          ...opt,
          id: get(opt, "id"),
          label: get(opt, "name"),
        };
      });

      const levelOptionsTemp = [...levelOptions];

      levelOptionsTemp[index] = newOptions;
      setLevelOptions(levelOptionsTemp);
    } catch (e) {
      setError("Something went wrong");
    }
  };

  const getData = async (index) => {
    let curlJson = curlCovertor.curlToJson(nextDataCurl);
    let url = curlJson?.url;
    const queryString = new URLSearchParams(curlJson?.query_params).toString();
    url = queryString ? `${url}?${queryString}` : url;

    let res = (await fetch(
      url,
      // `https://graph.microsoft.com/v1.0/me/drive/items/${
      //   levels[index - 1]?.id
      // }/children`,
      {
        method: "GET",
        headers: curlJson?.headers,
      }
    )) as any;
    res = await res?.json();
    let options = res.value;
    options = optionsPath ? eval(`res.${optionsPath}`) : options;

    const newOptions = options?.map((opt) => {
      return {
        ...opt,
        id: get(opt, "id"),
        label: get(opt, "name"),
      };
    });

    const levelOptionsTemp = [...levelOptions];

    levelOptionsTemp[index] = newOptions;
    setLevelOptions(levelOptionsTemp);
  };

  const fetchData = async (index) => {
    if (index === 0) await getInitialData(0);
    else await getData(index);
  };

  return (
    <>
      <div style={styles.container}>
        {levels?.map((level, index) => {
          return (
            <>
              &nbsp;/
              <Tile
                index={index}
                activeLevelIndex={activeLevelIndex}
                level={level}
                setActiveLevelIndex={setActiveLevelIndex}
                setShowSearchPopper={setShowSearchPopper}
                fetchData={fetchData}
              />
            </>
          );
        })}
        {(activeLevelIndex !== null || activeLevelIndex !== undefined) &&
        showSearchPopper ? (
          <SearchPopper
            searchRef={searchRef}
            showSearchPopper={showSearchPopper}
            setShowSearchPopper={setShowSearchPopper}
            searchOptions={levelOptions[activeLevelIndex]}
            onChange={onSelect}
            setActiveLevelIndex={setActiveLevelIndex}
          />
        ) : null}
        <AddButton
          value={value}
          levels={levels}
          setShowSearchPopper={setShowSearchPopper}
          setActiveLevelIndex={setActiveLevelIndex}
          fetchData={fetchData}
        />
      </div>
      {error ? <p>{error}</p> : null}
    </>
  );
};
