import classes from "./index.module.css";
// import ODSIcon from "oute-ds-icon";
// import ODSLabel from "oute-ds-label";
import { ODSIcon, ODSLabel } from "@src/module/ods";
import NoAgentsPreview from "../NoAgents";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import AGENT_NODE from "../../constant";

dayjs.extend(relativeTime);

const Agent = ({ agent, isSelected, setSelectedAgent }) => {
  const thumbnail = agent?.meta?.thumbnail;
  const createdDate = agent?.created_at
    ? dayjs(agent.created_at).fromNow()
    : "Unknown";

  return (
    <div
      onClick={() => {
        setSelectedAgent(agent);
      }}
      className={`${classes["agent"]} ${isSelected ? classes["agent-selected"] : ""}`}
      data-testid={`agent-item-${agent?._id}`}
    >
      <div className={classes["agent-thumbnail-container"]}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={agent?.name || "Agent thumbnail"}
            className={classes["agent-thumbnail"]}
            onError={(e) => {
              e.target.style.display = "none";
              const fallback = e.target.parentElement.querySelector(
                `.${classes["agent-thumbnail-fallback"]}`
              );
              if (fallback) {
                fallback.style.display = "flex";
              }
            }}
            data-testid={`agent-thumbnail-${agent?._id}`}
          />
        ) : null}
        <div
          className={classes["agent-thumbnail-fallback"]}
          style={{ display: thumbnail ? "none" : "flex" }}
          data-testid={`agent-thumbnail-fallback-${agent?._id}`}
        >
          <ODSIcon
            outeIconName="OUTEAgentIcon"
            outeIconProps={{
              sx: {
                width: "1.5rem",
                height: "1.5rem",
                fill: isSelected
                  ? AGENT_NODE.dark
                  : "var(--grey-darken-2, #546e7a)",
                opacity: 0.7,
              },
            }}
          />
        </div>
      </div>
      <div className={classes["agent-content"]}>
        <ODSLabel
          variant="body-1"
          className={classes["agent-name"]}
          title={agent?.name}
        >
          {agent?.name}
        </ODSLabel>
        <div className={classes["agent-meta"]}>
          <ODSLabel variant="caption" className={classes["agent-date-text"]}>
            Created {createdDate}
          </ODSLabel>
        </div>
      </div>
      <div className={classes["agent-selection-indicator"]}>
        {isSelected ? (
          <div className={classes["agent-checkmark"]}>
            <ODSIcon
              outeIconName="CheckIcon"
              outeIconProps={{
                sx: {
                  width: "1.25rem",
                  height: "1.25rem",
                  fill: AGENT_NODE.dark,
                },
              }}
            />
          </div>
        ) : (
          <div className={classes["agent-checkmark-placeholder"]} />
        )}
      </div>
    </div>
  );
};
const AgentsList = ({ agents, selectedAgent, setSelectedAgent }) => {
  return (
    <div className={classes["agents"]}>
      {!agents?.length && <NoAgentsPreview />}
      {agents?.length
        ? agents.map((agent, i) => {
            const isSelected =
              agent?._id === (selectedAgent?._id || selectedAgent?.id);

            return (
              <Agent
                key={`agent-${i}`}
                isSelected={isSelected}
                agent={agent}
                setSelectedAgent={setSelectedAgent}
              />
            );
          })
        : null}
    </div>
  );
};

export default AgentsList;
