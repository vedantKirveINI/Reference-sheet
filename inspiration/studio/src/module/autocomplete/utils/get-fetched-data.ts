export const getFetchedData = async ({ curlJson, settings }) => {
  let label = settings?.label;
  let id = settings?.id;
  let optionsPath = settings?.optionsPath;
  let mapAllObjectItems = settings?.mapAllObjectsItems;

  try {
    const url = curlJson?.url;

    const queryString = new URLSearchParams(curlJson?.query_params).toString();
    const urlWithParams = `${url}?${queryString}`;

    const response = await fetch(urlWithParams, {
      headers: curlJson?.headers,
      method: curlJson?.method,
      body: JSON.stringify(curlJson?.body),
    });
    const data = await response.json();
    const evaluatedData = optionsPath ? eval(`data.${optionsPath}`) : data;

    if (mapAllObjectItems) {
      const mappedData = evaluatedData.map((item) => {
        return {
          ...item,
          label: label ? item[label] : item.title,
          id: id ? item[id] : item.id,
        };
      });
      return mappedData;
    } else {
      const mappedData = evaluatedData.map((item) => {
        return {
          label: label ? item[label] : item.title,
          id: id ? item[id] : item.id,
        };
      });
      return mappedData;
    }
  } catch (error) {
  }
};
