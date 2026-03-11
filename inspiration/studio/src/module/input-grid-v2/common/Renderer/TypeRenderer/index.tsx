import { ODSAdvancedLabel, ODSIcon, ODSTooltip } from "@src/module/ods";
import TOOLTIP_MAPPING from "../../../constant/tooltipMapping";
import ShowInfo from "../../ShowInfo";
import { adornmentStyles, getContainerStyles, iconContainerStyles, labelStyles,  } from "./styles";

function TypeRenderer({
  value,
  readOnly,
  isCustom = false,
  icon,
  disableTypeEditing = false,
}) {
  return (
    <div style={getContainerStyles({ disableTypeEditing })}>
      {icon && (
        <div style={iconContainerStyles}>
          <ODSTooltip title={value}>
            <ODSIcon
              imageProps={{
                src: icon,
                style: { width: "1rem", height: "1rem" },
              }}
            />
          </ODSTooltip>
        </div>
      )}
      <div style={labelStyles}>{value}</div>
      <div style={adornmentStyles}>
        {!readOnly && !isCustom ? (
          <>
            <ShowInfo title={TOOLTIP_MAPPING[value]} />
            <ODSIcon
              outeIconName="OUTEChevronLeftIcon"
              outeIconProps={{
                sx: {
                  transform: "rotate(-90deg)",
                },
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );

  // return (
  //   <AdvancedLabel
  //     fullWidth
  //     labelProps={{
  //       sx: {
  //         fontSize: "1rem",
  //         color: "#263238",
  //       },
  //     }}
  //     leftAdornment={
  //       icon && (
  //         <ODSTooltip title={value}>
  //           <ODSIcon
  //             imageProps={{
  //               src: icon,
  //               style: { width: "1rem", height: "1rem" },
  //             }}
  //           />
  //         </ODSTooltip>
  //       )
  //     }
  //     rightAdornment={
  //       <div style={adornmentStyles}>
  //         {!readOnly && !isCustom ? (
  //           <>
  //             <ShowInfo title={TOOLTIP_MAPPING[value]} />
  //             <ODSIcon
  //               outeIconName="OUTEChevronLeftIcon"
  //               outeIconProps={{
  //                 sx: {
  //                   transform: "rotate(-90deg)",
  //                 },
  //               }}
  //             />
  //           </>
  //         ) : null}
  //       </div>
  //     }
  //     sx={{
  //       padding: "0.375rem",
  //       boxSizing: "border-box",
  //       height: "inherit",

  //       ...(!disableTypeEditing && {
  //         "&:hover": {
  //           background: "#F5F5F5",
  //           cursor: "pointer",
  //         },
  //       }),

  //       ".MuiTypography-root": {
  //         fontWeight: 400,
  //       },
  //     }}
  //     labelText={value}
  //   />
}

export default TypeRenderer;
