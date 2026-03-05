import { Template } from "./base";
import { within, userEvent, expect } from "@storybook/test";

export const Disabled = Template.bind({});
Disabled.args = {
  format: "MMDDYYYY",
  separator: "-",
  onChange: () => {},
  disabled: true,
};
Disabled.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByTestId("date-input") as HTMLInputElement;
  const datePickerIcon = canvas.queryByTestId("date-picker-icon");

  await expect(input).toBeDisabled();
  await expect(datePickerIcon).not.toBeInTheDocument();
};
