import { CANVAS_MODE, CANVAS_MODES } from "@oute/oute-ds.core.constants";
// import { ODSIcon as Icon } from '@src/module/ods';
import { ODSIcon as Icon } from "../../../ods";
import styles from "./styles.module.css";

const triggerTypeMapping = {
  manual: "manual trigger",
  timebased: "time based trigger",
  table: "table trigger",
  webhook: "webhook trigger",
  form: "form trigger",
  appbased: "app based trigger",
};

const getNoteText = ({ matchedCategory }) => {
  const mode = CANVAS_MODE();

  if (mode === CANVAS_MODES.WORKFLOW_CANVAS) {
    return "Triggers aren’t supported here — try creating a workflow instead";
  }

  if (matchedCategory === "trigger") {
    return (
      <>
        Did you mean one of the triggers — webhook, manual, table, form,
        time-based, or app-based? These can be configured from the{" "}
        <b>Setup Trigger</b> node on the canvas.
      </>
    );
  }

  return (
    <>
      Looking for <b>{triggerTypeMapping[matchedCategory]}</b> node? Open the{" "}
      <b>Setup Trigger</b> node on the canvas to explore it.
    </>
  );
};

function Note({ noteInfo }) {
  const { matchedCategory } = noteInfo;

  return (
    <div className={styles.container} role="alert" aria-live="polite">
      <Icon
        outeIconName="OUTEInfoIcon"
        outeIconProps={{
          sx: { color: "#1976d2", width: "2rem", height: "2rem" },
        }}
      />

      <div className={styles.text}>{getNoteText({ matchedCategory })}</div>
    </div>
  );
}

export default Note;
