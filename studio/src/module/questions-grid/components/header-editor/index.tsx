/* eslint-disable react/prop-types */
import { useState } from "react";
import { ODSTextField } from "@src/module/ods";
import { styles } from "../../styles";
export const HeaderEditor = ({
  column,
  index,
  handleHeaderNameChange,
  isCreator,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <th style={styles.headerText} onDoubleClick={() => setIsEditing(true)}>
        {(isEditing || !column?.name) && isCreator ? (
          <ODSTextField
            autoFocus
            placeholder="Column Name"
            value={column?.name}
            onChange={(e) => handleHeaderNameChange(index, e.target.value)}
            onBlur={() => setIsEditing(false)}
            inputProps={{
              "data-testid": "question-grid-header-input",
            }}
            style={styles.textFieldStyle}
          />
        ) : (
          column?.name
        )}
      </th>
    </>
  );
};
