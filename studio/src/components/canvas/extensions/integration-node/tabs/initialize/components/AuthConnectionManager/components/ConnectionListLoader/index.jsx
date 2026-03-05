import { useEffect, useState } from "react";
import classes from "./index.module.css";
// import ODSSkeleton from "oute-ds-skeleton";
import { ODSSkeleton } from "@src/module/ods";

const ConnectionListLoader = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setIsVisible(true);
  }, []);

  return (
    <div
      className={classes["loader-container"]}
      data-testid="connection-list-loader-container"
    >
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`${classes["loader-item"]} ${isVisible ? classes["visible"] : ""}`}
          data-testid={`connection-loader-item-${i}`}
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          {/* Radio button skeleton */}
          <ODSSkeleton
            data-testid={`connection-loader-radio-${i}`}
            variant="circular"
            width="1.25rem"
            height="1.25rem"
            className={classes["skeleton-radio"]}
          />

          {/* Connection display container - matches ConnectionDisplay structure */}
          <div className={classes["loader-display-container"]}>
            {/* Connection name skeleton */}
            <ODSSkeleton
              data-testid={`connection-loader-name-${i}`}
              variant="rounded"
              width="12rem"
              height="1.5rem"
              className={classes["skeleton-name"]}
            />

            {/* Dates skeleton - matches connection-dates structure */}
            <div className={classes["loader-dates"]}>
              <ODSSkeleton
                data-testid={`connection-loader-date-1-${i}`}
                variant="rounded"
                width="7rem"
                height="1.25rem"
                className={classes["skeleton-date"]}
              />
              <ODSSkeleton
                data-testid={`connection-loader-date-2-${i}`}
                variant="rounded"
                width="6rem"
                height="1.25rem"
                className={classes["skeleton-date"]}
              />
            </div>
          </div>

          {/* Actions skeleton */}
          <ODSSkeleton
            data-testid={`connection-loader-actions-${i}`}
            variant="rounded"
            width="4rem"
            height="1.5rem"
            className={classes["skeleton-actions"]}
          />
        </div>
      ))}
    </div>
  );
};

export default ConnectionListLoader;
