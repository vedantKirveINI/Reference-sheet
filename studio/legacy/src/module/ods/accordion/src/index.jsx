import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
// import ODSIcon from "oute-ds-icon";
import sharedAssets from "../../shared-assets/src/index.jsx";
import ODSIcon from "../../icon/src/index.jsx";
const default_theme = sharedAssets;
const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderRadius: "0.375rem !important",
          overflow: "hidden",
          "&.Mui-expanded": {
            height: "100%",
            margin: "0rem !important",
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: "2.5rem !important",
          height: "2.5rem",
          padding: "0px !important",
          gap: "1rem",
          flexDirection: "row-reverse",
        },
      },
    },
    MuiCollapse: {
      styleOverrides: {
        root: {
          maxHeight: "calc(100% - 2.5rem)",
          overflow: "auto",
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: "0rem !important",
        },
      },
    },
    //   MuiAccordion: {
    //     styleOverrides: {
    //       root: {
    //         boxShadow: "none",
    //         background: "transparent",
    //         padding: "0 !important",
    //         margin: "0 !important",
    //         borderRadius: "12px !important",
    //         overflow: "hidden",
    //       },
    //     },
    //   },
    //   MuiAccordionSummary: {
    //     styleOverrides: {
    //       root: {
    //         flexDirection: "row-reverse",
    //         padding: 0,
    //         minHeight: "auto !important",
    //         gap: "8px",
    //       },
    //       content: {
    //         margin: "8px 0 !important",
    //       },
    //     },
    //   },
    //   MuiAccordionDetails: {
    //     styleOverrides: {
    //       root: {
    //         padding: "8px",
    //       },
    //     },
    //   },
  },
});

const ODSAccordion = ({
  title,
  content,
  summaryProps = {},
  detailsProps = {},
  ...props
}) => {
  return (
    <ThemeProvider theme={theme}>
      <Accordion
        data-testid="ods-accordion"
        {...props}
        sx={{ border: "0.0625rem solid #CFD8DC", ...props?.sx }}
      >
        <AccordionSummary
          data-testid="ods-accordion-title"
          expandIcon={
            <ODSIcon
              outeIconName="OUTEExpandMoreIcon"
              sx={{ color: "#607D8B" }}
            />
          }
          {...summaryProps}
          sx={{ background: "#ECEFF1", ...summaryProps?.sx }}
        >
          {title}
        </AccordionSummary>
        <AccordionDetails data-testid="ods-accordion-content" {...detailsProps}>
          {content}
        </AccordionDetails>
      </Accordion>
    </ThemeProvider>
  );
};

export default ODSAccordion;
