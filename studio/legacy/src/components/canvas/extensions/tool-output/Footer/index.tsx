// import Button from "oute-ds-button";
import { ODSButton as Button } from "@src/module/ods";

const Footer = ({ saveHandler }) => {
  return (
    <div
      style={{
        padding: "1rem",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <Button
        onClick={() => {
          saveHandler(false);
        }}
        variant="black"
      >
        Save
      </Button>
    </div>
  );
};

export default Footer;
