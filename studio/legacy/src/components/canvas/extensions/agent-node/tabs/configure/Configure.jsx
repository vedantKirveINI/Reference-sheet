import { forwardRef, useEffect, useImperativeHandle } from "react";
import classes from "./index.module.css";
// import Label from "oute-ds-label";
// import TextField from "oute-ds-text-field";
// import { FormulaBar } from "oute-ds-formula-bar";
import { ODSLabel as Label, ODSFormulaBar as FormulaBar } from "@src/module/ods";
import {
  addIndices,
  removeIndicesStartingFromIndex,
} from "../../../extension-utils";
// import ToolsList from "../../components/ToolsList";

const Configure = forwardRef(
  (
    {
      workspaceId,
      data,
      variables,
      onChange = () => {},
      setValidTabIndices,
      setError,
      threadId,
      setThreadId,
      messageId,
      setMessageId,
      message,
      setMessage,
    },
    ref
  ) => {
    // const [selectedTools, setSelectedTools] = useState([]);

    useImperativeHandle(ref, () => {
      return {
        getData: () => {
          return {
            threadId,
            messageId,
            message,
            // selectedTools,
          };
        },
      };
    }, [threadId, messageId, message]);

    useEffect(() => {
      const validationErrors = {
        threadId: !threadId?.blocks?.length,
        messageId: !messageId?.blocks?.length,
        message: !message?.blocks?.length,
      };
      const hasErrors = Object.values(validationErrors).some((error) => error);
      if (hasErrors) {
        setValidTabIndices((prev) => removeIndicesStartingFromIndex(prev, 1));
        setError((prev) => ({
          ...prev,
          1: ["Please enter the above fields"],
        }));
      } else {
        setValidTabIndices((prev) => addIndices(prev, [1]));
        setError((prev) => ({
          ...prev,
          1: [],
        }));
      }
    }, [
      message?.blocks?.length,
      messageId?.blocks?.length,
      threadId?.blocks?.length,
      setValidTabIndices,
      setError,
    ]);

    return (
      <div className={classes["configure-container"]}>
        <div>
          <Label
            variant="h6"
            fontWeight="600"
            required
            data-testid="form-label"
          >
            Thread ID
          </Label>
          <div className={classes["label-container"]}>
            <Label
              variant="subtitle1"
              color="#607D8B"
              data-testid="form-description"
            >
              Enter the thread ID in which this agent will carry out the
              conversation. This ID identifies the conversation thread where the
              agent will interact and respond.
            </Label>
            <FormulaBar
              variables={variables}
              defaultInputContent={threadId?.blocks || []}
              onInputContentChanged={(content) => {
                setThreadId({
                  type: "fx",
                  blocks: content,
                });
              }}
              placeholder="Thread ID"
              wrapContent={true}
              slotProps={{
                container: {
                  style: {
                    overflow: "auto",
                    width: "100%",
                    marginTop: "0.5rem",
                  },
                },
              }}
            />
          </div>
        </div>
        <div className={classes["field-container"]}>
          <Label
            variant="h6"
            fontWeight="600"
            required
            data-testid="form-label"
          >
            Message ID
          </Label>
          <div className={classes["label-container"]}>
            <Label
              variant="subtitle1"
              color="#607D8B"
              data-testid="form-description"
            >
              Enter the message ID that the agent will respond to. This ID
              corresponds to the specific message in the thread that the agent
              will target for replying.
            </Label>
            <FormulaBar
              variables={variables}
              defaultInputContent={messageId?.blocks || []}
              onInputContentChanged={(content) => {
                setMessageId({
                  type: "fx",
                  blocks: content,
                });
              }}
              placeholder="Message ID"
              wrapContent={true}
              slotProps={{
                container: {
                  style: {
                    overflow: "auto",
                    width: "100%",
                    marginTop: "0.5rem",
                  },
                },
              }}
            />
          </div>
        </div>
        <div className={classes["field-container"]}>
          <Label
            variant="h6"
            fontWeight="600"
            required
            data-testid="form-label"
          >
            Message
          </Label>
          <div className={classes["label-container"]}>
            <Label
              variant="subtitle1"
              color="#607D8B"
              data-testid="form-description"
            >
              Enter the message that the agent will respond to. This is the
              content or the context of the message that the agent will use to
              formulate its reply.
            </Label>
            <FormulaBar
              variables={variables}
              defaultInputContent={message?.blocks || []}
              onInputContentChanged={(content) => {
                setMessage({
                  type: "fx",
                  blocks: content,
                });
              }}
              placeholder="Message"
              wrapContent={true}
              slotProps={{
                container: {
                  style: {
                    overflow: "auto",
                    width: "100%",
                    marginTop: "0.5rem",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* <div className={classes["field-container"]}>
          <Label
            variant="h6"
            fontWeight="600"
            required
            data-testid="form-label"
          >
            Select tools agents should use
          </Label>
          <div className={classes["label-container"]}>
            <Label
              variant="subtitle1"
              color="#607D8B"
              data-testid="form-description"
            >
              Select the tools that the agent should use to respond in the
              selected thread. These tools will help the agent process and
              respond to the message in the conversation thread efficiently.
            </Label>
            <ToolsList
              workspaceId={workspaceId}
              selectedTools={selectedTools}
              setSelectedTools={setSelectedTools}
            />
          </div>
        </div> */}
      </div>
    );
  }
);

export default Configure;
