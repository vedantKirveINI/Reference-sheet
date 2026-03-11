import { useEffect, useState } from "react";
import assetSDKServices from "../../../../services/assetSDKServices";
import classes from "./index.module.css";
// import Label from "oute-ds-label";
// import ODSCheckbox from "oute-ds-checkbox";
import { ODSLabel as Label, ODSCheckbox } from "@src/module/ods";

const ToolsList = ({ workspaceId, selectedTools, setSelectedTools }) => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const query = {
          workspace_id: workspaceId,
          annotation: "TOOL",
          sort_by: "edited_at",
          sort_type: "desc",
        };

        const res = await assetSDKServices.getFlatList(query);
        const result = res.result;
        setTools(result);
      } catch (error) {
        console.error("Failed to fetch tools:", error);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchTools();
    }
  }, [workspaceId]);

  return (
    <div className={classes["container"]}>
      <p className={classes["heading"]}>Select Tools</p>

      <div className={classes["tools-list"]}>
        {tools.map((tool, index) => {
          const isChecked = Boolean(selectedTools.includes(tool._id));
          return (
            <div
              onClick={() => {
                const index = selectedTools?.indexOf(tool?._id);
                if (index === -1) {
                  setSelectedTools([...selectedTools, tool?._id]);
                } else {
                  const newTools = [...selectedTools];
                  newTools?.splice(index, 1);
                  setSelectedTools(newTools);
                }
              }}
              key={tool._id}
              className={classes["form-item"]}
            >
              <ODSCheckbox variant="black" checked={isChecked} />
              <div className={classes["name"]}>{tool.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ToolsList;
