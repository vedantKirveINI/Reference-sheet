import React, { useState } from "react";
// import AdvancedLabel from "oute-ds-advanced-label";

// import DynamicSection from "oute-ds-dynamic-section";
// import Button from "oute-ds-button";
// import Dialog from "oute-ds-dialog";
// import Icon from "oute-ds-icon";
import { ODSAdvancedLabel as AdvancedLabel, ODSDynamicSection as DynamicSection, ODSButton as Button, ODSDialog as Dialog, ODSIcon as Icon } from "@src/module/ods";
import Lottie from "lottie-react";
import pendingAnimation from "../../../assets/lotties/idle.json";
import successAnimation from "../../../assets/lotties/publish-success.json";
import failedAnimation from "../../../assets/lotties/publish-failure.json";

const TestAPIDialog = ({ data = {}, onClose, publishStatus = "" }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  return (
    <Dialog
      open={true}
      showFullscreenIcon={false}
      onClose={() => {
        if (!isAnimating || !publishStatus) onClose();
      }}
      hideBackdrop={false}
      transition="slide"
      dialogWidth="28rem"
      dialogHeight="24rem"
      dividers={false}
      dialogPosition="coordinates"
      dialogCoordinates={{ top: "5rem", right: "0.5rem" }}
      removeContentPadding
      showCloseIcon={!isAnimating || !publishStatus}
      dialogContent={
        <div
          style={{
            display: "grid",
            gridTemplateRows: "auto auto",
            width: "100%",
            height: "100%",
            padding: "1rem",
            boxSizing: "border-box",
            marginTop: isAnimating && publishStatus ? "52px" : 0,
          }}
        >
          {publishStatus === "pending" && (
            <Lottie
              animationData={pendingAnimation}
              loop={true}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "250px",
              }}
            />
          )}
          {publishStatus === "success" && isAnimating && (
            <>
              <Lottie
                animationData={successAnimation}
                loop={false}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "250px",
                }}
                onComplete={() => setIsAnimating(false)}
              />
            </>
          )}
          {((publishStatus === "success" && !isAnimating) ||
            (!publishStatus && data)) && (
            <>
              <div
                style={{
                  width: "400px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <DynamicSection
                  config={data?.asset?.published_info?.details?.formatted_data}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <AdvancedLabel
                  labelText={`${new Date(
                    data?.asset?.published_info?.published_at,
                  ).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}.`}
                  leftAdornment={
                    <Icon
                      outeIconName="OUTEDoneIcon"
                      outeIconProps={{
                        sx: { color: "#4CAF50" },
                      }}
                    />
                  }
                  labelProps={{
                    fontSize: "1rem",
                  }}
                />
                <Button
                  label="PUBLISH"
                  variant="contained"
                  onClick={() => {
                    onClose(true);
                  }}
                />
              </div>
            </>
          )}
          {publishStatus === "failed" && (
            <>
              <Lottie
                animationData={failedAnimation}
                loop={false}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "250px",
                }}
                onComplete={() => setIsAnimating(false)}
              />
              {!isAnimating && (
                <div
                  style={{ display: "grid", gridTemplateColumns: "auto auto" }}
                >
                  <AdvancedLabel
                    labelText="Something went wrong"
                    leftAdornment={
                      <Icon
                        outeIconName="OUTEWarningIcon"
                        outeIconProps={{
                          sx: { color: "#E88612" },
                        }}
                      />
                    }
                    labelProps={{
                      fontSize: "1rem",
                    }}
                  />
                  <Button
                    label="TRY AGAIN"
                    variant="contained"
                    onClick={() => {
                      onClose(true);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      }
    />
  );
};

export default TestAPIDialog;
