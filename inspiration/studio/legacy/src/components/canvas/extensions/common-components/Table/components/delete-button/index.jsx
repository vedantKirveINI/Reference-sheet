import React from "react";
import classes from "./index.module.css";

const DeleteButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classes.deleteButton}
      aria-label="Delete row"
    >
      <img
        style={{ height: 15, width: 15 }}
        src="https://cdn-icons-png.flaticon.com/512/1214/1214428.png"
      />
    </button>
  );
};

export default DeleteButton;
