// import Icon from "oute-ds-icon";
// import Label from "oute-ds-label";
import { ODSIcon as Icon, ODSLabel as Label } from "@src/module/ods";
import classes from "./EmptyTestScreen.module.css";

const EmptyTestScreen = () => {
  return (
    <div className={classes["notest-container"]}>
      <Icon
        name="play"
        imageProps={{
          src: "https://cdn-v1.tinycommand.com/1234567890/1758087769882/Test%20Empty%20State.svg",
          alt: "empty-test",
          width: "150px",
          height: "150px",
          dataTestId: "empty-test-image",
        }}
      />
      <div className={classes["text-container"]} data-testid="text-container">
        <Label variant="h6" fontWeight={600}>
          Ready to Test
        </Label>
        <Label variant="body1" color="grey">
          Click <strong>TEST</strong> to run your node and see how it processes
          data. Results will appear here instantly.
        </Label>
      </div>
    </div>
  );
};

export default EmptyTestScreen;
