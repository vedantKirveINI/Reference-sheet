import React from "react";
// import Label from "oute-ds-label";
// import Icon from "oute-ds-icon";
import { ODSLabel as Label, ODSIcon as Icon } from "@src/module/ods";
import { AGENT_TYPES } from "../../constants/types";
import { getAgentNode } from "../../extension-utils";
import styles from "./SelectTrigger.module.css";
const SelectTrigger = ({ onTriggerTypeChange = () => {} }) => {
  return (
    <div className={styles.container}>
      <Label variant="body1" fontWeight={600}>
        Choose your preferred trigger to initiate automation.
      </Label>
      <div className={styles.agentCardContainer}>
        {AGENT_TYPES.map((type, index) => {
          const agentNode = getAgentNode(type);
          return (
            <div
              key={`${type}_${index}`}
              className={styles.agentCard}
              onClick={() => {
                onTriggerTypeChange(type);
              }}
            >
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <Icon
                  imageProps={{ src: agentNode?._src, width: 24, height: 24 }}
                />
                <Label variant="h6">{agentNode?.name}</Label>
              </div>
              <Label variant="subtitle2">{agentNode?.hoverDescription}</Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectTrigger;
