import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export function getTimeAndMeridian(value: any) {
  if (!value || value?.ISOValue === "") {
    return {
      time: "",
      meridiem: "AM",
    };
  }

  const dateObject = dayjs(value?.ISOValue).tz();
  const formattedTime = dateObject.format("hh:mm A"); // 10:09 AM
  const [time, meridiem] = formattedTime.split(" ");

  return {
    time: time,
    meridiem: meridiem.toUpperCase(),
  };
}
