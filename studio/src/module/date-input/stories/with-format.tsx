import { Template } from "./base";
import { within, userEvent, expect } from "@storybook/test";

export const WithFormat = Template.bind({});
WithFormat.args = {
  format: "MMDDYYYY",
  separator: "-",
  onChange: () => {},
};
WithFormat.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByTestId("date-input") as HTMLInputElement;

  await userEvent.type(input, "03152023");
  await expect(input.value).toBe("03-15-2023");
};
