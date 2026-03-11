import { Template } from "./base";
import { within, userEvent, expect, spyOn, fn } from "@storybook/test";

export const WithCalendar = Template.bind({});
WithCalendar.args = {
  format: "MMDDYYYY",
  separator: "/",
  enableCalender: true,
  onChange: fn(),
};
WithCalendar.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByTestId("date-input") as HTMLInputElement;
  const datePickerIcon = canvas.getByTestId("date-picker-icon");

  expect(datePickerIcon).toBeInTheDocument();

  await userEvent.type(input, "12022023");
  await expect(input.value).toBe("12/02/2023");

  expect(args.onChange).toHaveBeenCalled();
  expect(args.onChange).toHaveBeenCalledTimes(8); // Once for each character typed

  // Check the intermediate calls
  expect(args.onChange).toHaveBeenNthCalledWith(1, {
    value: "1",
    ISOValue: "",
  });
  expect(args.onChange).toHaveBeenNthCalledWith(2, {
    value: "12/",
    ISOValue: "",
  });
  expect(args.onChange).toHaveBeenNthCalledWith(3, {
    value: "12/0",
    ISOValue: "",
  });
  expect(args.onChange).toHaveBeenNthCalledWith(4, {
    value: "12/02/",
    ISOValue: "",
  });
  expect(args.onChange).toHaveBeenNthCalledWith(5, {
    value: "12/02/2",
    ISOValue: "",
  });
  expect(args.onChange).toHaveBeenNthCalledWith(6, {
    value: "12/02/20",
    ISOValue: "",
  });
  expect(args.onChange).toHaveBeenNthCalledWith(7, {
    value: "12/02/202",
    ISOValue: "",
  });

  // Check the final call
  expect(args.onChange).toHaveBeenLastCalledWith({
    value: "12/02/2023",
    ISOValue: "2023-12-01T18:30:00.000Z",
  });
};
