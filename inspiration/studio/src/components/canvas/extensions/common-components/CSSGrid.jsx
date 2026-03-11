import React from "react";
import PropTypes from "prop-types";
import classes from "./CSSGrid.module.css";
import NoRowsOverlayComponent from "./NoRowsOverlayComponent";

const CSSGrid = ({
  headers = {},
  data = [],
  actionRow = null,
  noRowsOverlayComponent = null,
}) => {
  return (
    <>
      <div
        className={`${classes["grid-container"]} ${
          actionRow && classes["has-action-row"]
        } ${data.length === 0 && classes["no-rows"]}`}
        style={{
          gridTemplateColumns: headers?.gridTemplateColumns,
        }}
      >
        {headers.fields.map((field, index) => {
          return (
            <div
              className={`${classes["grid-item"]} ${classes["no-border-top"]} ${
                index === 0 && classes["no-border-left"]
              } ${classes.header} ${
                data.length === 0 && classes["has-border-bottom"]
              } `}
            >
              {field}
            </div>
          );
        })}
        {data.length > 0 &&
          data.map((row, parentIndex) => {
            return row.map((rowItem, index) => {
              return (
                <div
                  className={`${classes["grid-item"]} ${
                    index === 0 && classes["no-border-left"]
                  } ${
                    actionRow &&
                    parentIndex === data.length - 1 &&
                    classes["has-border-bottom"]
                  }`}
                >
                  {rowItem}
                </div>
              );
            });
          })}
        {data.length === 0 && (
          <div style={{ gridColumn: "1/-1" }}>
            {noRowsOverlayComponent || <NoRowsOverlayComponent />}
          </div>
        )}
      </div>
      {actionRow && <div className={classes["action-row"]}>{actionRow}</div>}
    </>
  );
};

export default CSSGrid;

CSSGrid.propTypes = {
  headers: PropTypes.instanceOf(Object),
  data: PropTypes.instanceOf(Array),
  actionRow: PropTypes.node,
  noRowsOverlayComponent: PropTypes.node,
};

CSSGrid.defaultProps = {
  headers: {},
  data: [],
  actionRow: null,
  noRowsOverlayComponent: null,
};
