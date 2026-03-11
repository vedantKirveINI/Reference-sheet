export const getPlaceholder = ({ format, separator }) => {
  let newFormat = "";

  if (format === "YYYYMMDD") {
    newFormat = `YYYY${separator}MM${separator}DD`;
  }
  if (format === "MMDDYYYY") {
    newFormat = `MM${separator}DD${separator}YYYY`;
  }
  if (format === "DDMMYYYY") {
    newFormat = `DD${separator}MM${separator}YYYY`;
  }
  return newFormat;
};

export const getMask = ({ format, separator }) => {
  let mask = "";
  if (format === "YYYYMMDD") {
    mask = `9999${separator}99${separator}99`;
  }
  if (format === "MMDDYYYY" || format === "DDMMYYYY") {
    mask = `99${separator}99${separator}9999`;
  }

  return mask;
};

export const formatDate = ({ format, separator }) => {
  let newFormat = `99${separator}99${separator}9999`;
  if (format === "YYYYMMDD") {
    newFormat = `9999${separator}99${separator}99`;
  }
  if (format === "MMDDYYYY") {
    newFormat = `99${separator}99${separator}9999`;
  }

  return newFormat;
};

export const formatPlaceholder = ({ format, separator }) => {
  let newFormat = `DD${separator}MM${separator}YYYY`;

  if (format === "YYYYMMDD") {
    newFormat = `YYYY${separator}MM${separator}DD`;
  }
  if (format === "MMDDYYYY") {
    newFormat = `MM${separator}DD${separator}YYYY`;
  }
  return newFormat;
};

export const formatDatePicker = ({ format, separator, _date }) => {
  const newdate = new Date(_date);
  let day = newdate.getDate() as any;
  let month = newdate.getMonth() + 1 as any;
  const year = newdate.getFullYear();

  if (day < 10) {
    day = `0${day}`;
  }
  if (month < 10) {
    month = `0${month}`;
  }
  let fomatedDate = "";
  if (format === "DDMMYYYY") {
    fomatedDate = `${day}${separator}${month}${separator}${year}`;
  }
  if (format === "MMDDYYYY") {
    fomatedDate = `${month}${separator}${day}${separator}${year}`;
  }
  if (format === "YYYYMMDD") {
    fomatedDate = `${year}${separator}${month}${separator}${day}`;
  }
  return fomatedDate;
};
