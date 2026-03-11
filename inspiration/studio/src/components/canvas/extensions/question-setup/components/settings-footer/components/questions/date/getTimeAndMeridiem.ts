export function getTimeAndMeridiam(value: any) {
  if (!value || value?.ISOValue === "") {
    return {
      time: "",
      meridiem: "AM",
    };
  }

  // Create a Date object from the ISO string
  const _date = new Date(value?.ISOValue);

  // Options to get the time with timezone
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // To get 12-hour format with AM/PM
    timeZoneName: "short", // Get timezone abbreviation like PST, UTC, etc.
  };

  // Get the local time with timezone adjustment
  //local is undefined so that it will capture system setting
  const timeWithZone = _date.toLocaleTimeString(undefined, options);

  // Split the result into time and meridiem parts
  const [time, meridiem] = timeWithZone.split(" ");

  return {
    time: time,
    meridiem: meridiem.toUpperCase(),
  };
}
