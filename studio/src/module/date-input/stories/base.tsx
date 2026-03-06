import React from "react";
import type { StoryObj } from "@storybook/react";
import { DateInput, IDateInputValue, DateInputProps } from "../index";

export type Story = StoryObj<typeof DateInput>;

export const Template = (args: DateInputProps) => {
  const [value, setValue] = React.useState<IDateInputValue>(
    args.value || {
      value: "",
      ISOValue: "",
    }
  );

  const handleDateInputChange = (value: IDateInputValue) => {
    setValue(value);
    args.onChange && args.onChange(value);
  };

  return (
    <div>
      <DateInput
        {...args}
        value={value}
        onChange={(v) => handleDateInputChange(v)}
      />
    </div>
  );
};
