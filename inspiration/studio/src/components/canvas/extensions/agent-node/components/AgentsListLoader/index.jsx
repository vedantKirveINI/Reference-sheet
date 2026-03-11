import { useEffect, useState } from "react";
import classes from "./index.module.css";
// import ODSSkeleton from "oute-ds-skeleton";
import { ODSSkeleton } from "@src/module/ods";

const AgentsListLoader = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={classes["loader-container"]}
      data-testid="agents-list-loader-container"
    >
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`${classes["loader-item"]} ${isVisible ? classes["visible"] : ""}`}
          data-testid={`agent-loader-item-${i}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {/* Radio button skeleton */}
          <ODSSkeleton
            data-testid={`agent-loader-radio-${i}`}
            variant="circular"
            width="1.25rem"
            height="1.25rem"
            className={classes["skeleton-radio"]}
          />

          {/* Thumbnail skeleton */}
          <div className={classes["loader-thumbnail-container"]}>
            <ODSSkeleton
              data-testid={`agent-loader-thumbnail-${i}`}
              variant="circular"
              width="3.5rem"
              height="3.5rem"
              className={classes["skeleton-thumbnail"]}
            />
          </div>

          {/* Agent info skeleton */}
          <div className={classes["loader-info"]}>
            <ODSSkeleton
              data-testid={`agent-loader-name-${i}`}
              variant="rounded"
              width="12rem"
              height="1.5rem"
              className={classes["skeleton-name"]}
            />
            <ODSSkeleton
              data-testid={`agent-loader-date-${i}`}
              variant="rounded"
              width="8rem"
              height="1.25rem"
              className={classes["skeleton-date"]}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentsListLoader;
