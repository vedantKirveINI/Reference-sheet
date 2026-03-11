import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;

export const TINYScratchMailIcon = (props) => {
  const { ...rest } = props.sx || {}; // Destructure background and color, and collect the rest of the properties
  return (
    <SvgIcon
      viewBox="0 0 96 96"
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        ...rest,
      }}
    >
      <path
        d="M84.8614 0H11.1386C4.98692 0 0 4.98692 0 11.1386V84.8614C0 91.0131 4.98692 96 11.1386 96H84.8614C91.0131 96 96 91.0131 96 84.8614V11.1386C96 4.98692 91.0131 0 84.8614 0Z"
        fill="url(#paint0_linear_4473_76497)"
      />
      <path
        d="M47.999 65.5624C47.4144 65.5624 46.9246 65.3647 46.5298 64.9695C46.1349 64.5742 45.9375 64.0843 45.9375 63.4999V49.0624H31.4999C30.9156 49.0624 30.4257 48.8646 30.0305 48.4692C29.6352 48.0737 29.4375 47.5836 29.4375 46.999C29.4375 46.4144 29.6352 45.9246 30.0305 45.5298C30.4257 45.1349 30.9156 44.9375 31.4999 44.9375H45.9375V30.4999C45.9375 29.9156 46.1352 29.4257 46.5307 29.0304C46.9262 28.6351 47.4162 28.4375 48.0008 28.4375C48.5855 28.4375 49.0752 28.6351 49.4701 29.0304C49.8649 29.4257 50.0624 29.9156 50.0624 30.4999V44.9375H64.4999C65.0843 44.9375 65.5742 45.1352 65.9695 45.5307C66.3647 45.9262 66.5624 46.4162 66.5624 47.0008C66.5624 47.5855 66.3647 48.0752 65.9695 48.4701C65.5742 48.8649 65.0843 49.0624 64.4999 49.0624H50.0624V63.4999C50.0624 64.0843 49.8646 64.5742 49.4692 64.9695C49.0737 65.3647 48.5836 65.5624 47.999 65.5624Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_4473_76497"
          x1="108.149"
          y1="-18"
          x2="-59"
          y2="149.149"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EC3957" />
          <stop offset="0.396778" stopColor="#F24F54" />
          <stop offset="0.95" stopColor="#FF7F4C" />
          <stop offset="1" stopColor="#FF7B52" />
        </linearGradient>
      </defs>
    </SvgIcon>
  );
};
