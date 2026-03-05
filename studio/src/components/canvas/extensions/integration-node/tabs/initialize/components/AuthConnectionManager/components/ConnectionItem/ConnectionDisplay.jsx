import classes from "./index.module.css";

const ConnectionDisplay = ({ connectionName, createdDate, lastSyncedDate }) => {
  return (
    <div
      className={classes["connection-display-container"]}
      data-testid="connection-display-container"
    >
      <div
        className={classes["connection-name"]}
        data-testid="connection-name-display"
        title={connectionName}
      >
        {connectionName}
      </div>
      <div
        className={classes["connection-dates"]}
        data-testid="connection-date-display"
      >
        <div className={classes["date-item"]}>Created {createdDate}</div>
        <div className={classes["date-item"]}>Synced {lastSyncedDate}</div>
      </div>
    </div>
  );
};

export default ConnectionDisplay;
