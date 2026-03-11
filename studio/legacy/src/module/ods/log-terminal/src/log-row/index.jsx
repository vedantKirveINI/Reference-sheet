import React, { forwardRef } from "react";
import { JSON_TYPE } from '../constant.jsx';
import { Inspector } from "react-inspector";
import classes from './LogRow.module.css';

const LogRow = forwardRef(
  (
    { createdAt = "", message = "", icon, showIcon, messageType = null },
    ref
  ) => {
    return (
      <div className={classes["log-row"]} ref={ref}>
        <div className={classes["log-row-icon"]}>{showIcon ? icon : <></>}</div>
        <div className={classes["log-row-created-at"]}>{createdAt}</div>
        <div className={classes["log-row-message"]}>
          {messageType === JSON_TYPE ? <Inspector data={message} /> : message}
        </div>
      </div>
    );
  }
);
export default LogRow;
