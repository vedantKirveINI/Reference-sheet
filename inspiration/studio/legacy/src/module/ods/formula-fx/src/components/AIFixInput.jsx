import React, { useState, useRef } from "react";
import classes from "./AIFixInput.module.css";

const AIFixInput = ({
  value: controlledValue,
  onChange,
  placeholder = "Explain your formula what you want to have.",
  onEnter,
}) => {
  const [internalValue, setInternalValue] = useState("");
  const inputRef = useRef(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onEnter) {
        onEnter(value);
      } else {
        console.log(value);
      }
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.iconContainer}>
        <div className={classes.icon} />
      </div>
      <input
        ref={inputRef}
        type="text"
        className={classes.input}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
};

export default AIFixInput;

