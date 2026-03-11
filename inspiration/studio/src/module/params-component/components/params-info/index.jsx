import classes from "./index.module.css";

const ParamsInfo = ({ title = "", description = "" }) => {
  return (
    <div
      className={classes.wrapper}
      data-testid={`${title}-params-info-container`}
    >
      <h3
        className={classes.heading}
        data-testid={`${title}-params-info-heading`}
      >
        {title}
      </h3>
      <p
        className={classes.description}
        data-testid={`${title}-params-info-description`}
      >
        {description}
      </p>
    </div>
  );
};

export default ParamsInfo;
