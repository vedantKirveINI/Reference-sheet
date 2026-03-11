import { forwardRef } from "react";
// import ODSLabel from "oute-ds-label";
import { ODSLabel } from "@src/module/ods";
import classes from "./app-icon-label.module.css";

const AppIconWithLabel = forwardRef(
  ({ icon, name, title, backgroundColor, expanded, index }, ref) => {
    return (
      <div className={classes["app-icon"]} data-testid={`app-items-${index}`}>
        <div
          className={classes["app-icon-container"]}
          style={{ backgroundColor: backgroundColor || "#FAFCFE" }}
        >
          <img
            src={icon}
            alt={name}
            style={{
              width: "1.25rem",
              height: "1.25rem",
              flexShrink: 0,
            }}
            data-testid={`app-items-icon-${index}`}
          />
        </div>
        <ODSLabel
          ref={ref}
          variant="body1"
          sx={{
            display: expanded ? "flex" : "-webkit-box",
            color: "var(--grey-darken-4, #263238)",
            fontFamily: "Inter",
            fontSize: "1rem",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "1.75rem",
            letterSpacing: "0.00938rem",
            ...(expanded
              ? {
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.125rem",
                }
              : {
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 1,
                  alignSelf: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }),
          }}
          data-testid={`app-items-label-${index}`}
        >
          {title ? `${title} - ` : ""}
          {name}
        </ODSLabel>
      </div>
    );
  },
);

export default AppIconWithLabel;
