import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const WCFolderIcon = (props) => {
  const { color, ...rest } = props.sx || {}; // Destructure background and color, and collect the rest of the properties
  return (
    <SvgIcon
      viewBox={`0 0 24 24`}
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        ...rest,
      }}
    >
      <path
        d="M4.3077 19.5001C3.80257 19.5001 3.375 19.3251 3.025 18.9751C2.675 18.6251 2.5 18.1975 2.5 17.6924V6.69244C2.5 6.18732 2.675 5.75977 3.025 5.40977C3.375 5.05977 3.80257 4.88477 4.3077 4.88477H10.3846L12 6.50012H19.6923C20.1974 6.50012 20.625 6.67512 20.975 7.02512C21.325 7.37512 21.5 7.80268 21.5 8.30782V17.6924C21.5 18.1975 21.325 18.6251 20.975 18.9751C20.625 19.3251 20.1974 19.5001 19.6923 19.5001H4.3077Z"
        fill={`${color || "#fb8c00"}`}
      />
    </SvgIcon>
  );
};
