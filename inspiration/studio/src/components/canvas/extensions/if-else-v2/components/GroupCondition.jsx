import React from "react";
import StatementRow from "./StatementRow";

const GroupCondition = ({
  group,
  index,
  variables,
  onChange = () => {},
  onDelete = () => {},
}) => {
  return (
    <div className="w-full min-w-0" data-testid={`group-condition-field-${index}`}>
      <StatementRow
        key={`${group.id}-${index}`}
        statement={group}
        isGroup={true}
        variables={variables}
        onChange={(statement) => {
          onChange(statement, index);
        }}
        onDelete={() => {
          onDelete(index);
        }}
      />
    </div>
  );
};

export default GroupCondition;
