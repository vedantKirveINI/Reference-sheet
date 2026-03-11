import React from "react";
import classes from "./SearchBar.module.css";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search",
  onKeyDown,
  onFocus,
}) => {
  const handleFocus = (e) => {
    e.stopPropagation();
    if (onFocus) {
      onFocus(e);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.searchIcon}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 14L10.5 10.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <input
        type="text"
        className={classes.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={handleFocus}
      />
    </div>
  );
};

export default SearchBar;
