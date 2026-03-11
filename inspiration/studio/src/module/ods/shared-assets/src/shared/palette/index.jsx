import { grey, blue } from './colors.jsx';

const palette = {
  primary: blue,
  error: {
    main: "rgb(255, 82, 82)",
  },
  info: {
    main: blue.main,
  },
  success: {
    main: "rgb(76, 175, 80)",
  },
  warning: {
    main: "rgb(251, 140, 0)",
  },
  blue,
  grey,
  "oute-background-color": grey[50],
  "oute-background-hover": "rgba(38, 50, 56, 0.1)",
  "oute-background-active": blue.main,
  "oute-background-selected": blue[50],
};
export default palette;
