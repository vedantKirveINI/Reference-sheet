// import AdvancedLabel from "oute-ds-advanced-label";
// import Icon from "oute-ds-icon";
// import Tooltip from "oute-ds-tooltip";
// import Label from "oute-ds-label";
import { ODSAdvancedLabel as AdvancedLabel, ODSIcon as Icon, ODSTooltip as Tooltip, ODSLabel as Label } from "@src/module/ods";
import Lottie from "lottie-react";
import animationData from "../../assets/lotties/premium.json";

// import Button from "oute-ds-button";
// import {
//   getCommandBarNudgeIdForQuestionHelper,
//   localStorageConstants,
//   QuestionType,
// } from "@oute/oute-ds.core.constants";
const CommonDrawerTitle = ({
  title,
  showEditButton = true,
  node = {},
  onEditTitleClicked = () => {}, //TODO
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* <AdvancedLabel
        fullWidth={false}
        labelText={title.name}
        labelSubText={node?.name !== title?.name?.trim() ? node.name : ""}
        sx={{
          maxWidth: "max-content",
          width: "auto",
        }}
        data-testid="drawer-title"
        labelProps={{
          sx: {
            color: "var(--grey-darken-4, #263238)",
            font: "var(--h5)",
            letterSpacing: "var(--h5-letter-spacing)",
          },
        }}
        leftAdornment={
          title.icon ? (
            <Icon
              imageProps={{
                src: title.icon,
                style: {
                  borderRadius: "50%",
                  border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
                  width: "1.5rem",
                  height: "1.5rem",
                },
                "data-testid": "drawer-icon",
              }}
            />
          ) : null
        }
        rightAdornment={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {!!title.hoverDescription && (
              <Tooltip
                title={title.hoverDescription}
                style={{
                  font: "var(--body1) !important",
                  letterSpacing: "var(--body1-letter-spacing) !important",
                }}
                arrow={false}
                data-test-id="drawer-description-tooltip"
              >
                <div
                  style={{
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    outeIconName="OUTEInfoIcon"
                    outeIconProps={{
                      sx: { cursor: "pointer" },
                      "data-testid": "drawer-description-icon",
                    }}
                  />
                </div>
              </Tooltip>
            )}
            {!!showEditButton && (
              <Icon
                outeIconName="OUTEEditIcon"
                buttonProps={{
                  sx: { padding: 0 },
                  "data-testid": "drawer-edit-icon",
                }}
                onClick={onEditTitleClicked}
              />
            )}
          </div>
        }
      /> */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          height: "100%",
        }}
      >
        {title.icon && (
          <Icon
            imageProps={{
              src: title.icon,
              style: {
                width: "1.75rem",
                height: "1.75rem",
              },
              "data-testid": "node-drawer-icon",
            }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <Label variant="h6" data-testid="node-drawer-title">
              {title.name}
            </Label>
            {!!title.hoverDescription && (
              <Tooltip
                title={title.hoverDescription}
                style={{
                  font: "var(--body1) !important",
                  letterSpacing: "var(--body1-letter-spacing) !important",
                }}
                arrow={false}
                data-test-id="node-drawer-description-tooltip"
              >
                <div
                  style={{
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    outeIconName="OUTEInfoIcon"
                    outeIconProps={{
                      sx: { cursor: "pointer", padding: 0, color: "#212121" },
                      "data-testid": "node-drawer-description-icon",
                    }}
                  />
                </div>
              </Tooltip>
            )}
            {!!showEditButton && (
              <Icon
                outeIconName="OUTEEditIcon"
                buttonProps={{
                  sx: { padding: 0 },
                  "data-testid": "node-drawer-edit-icon",
                }}
                onClick={onEditTitleClicked}
              />
            )}
          </div>
          <Label
            variant="subtitle2"
            color="#607D8B"
            data-testid="node-drawer-subtitle"
          >
            {node?.name !== title?.name?.trim() ? node.name : ""}
          </Label>
        </div>
      </div>
      {title?.premium && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #f1b747",
            background: "#fff6e4",
            padding: "0 0.5rem 0 0",
            borderRadius: "6px",
          }}
        >
          <Lottie
            animationData={animationData}
            loop={true}
            style={{
              height: "2.25rem",
            }}
          />
          <Label variant="capital">PREMIUM</Label>
        </div>
      )}
    </div>
  );
};

export default CommonDrawerTitle;
