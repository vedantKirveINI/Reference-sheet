export const disabledContainer = {
  background: "#CFD8DC",
  borderBottom: " 0.047rem solid #CFD8DC",
  height: "100%",
  cursor: "not-allowed",
};

export const getContainerStyles = ({ disable, showEditor }) => ({
  height: "100%",

  "&:hover": {
    ...(!disable &&
      !showEditor && {
        background: "#F5F5F5",
        cursor: "pointer",
      }),
  },
});

export const disabledCell = {
  cursor: "default",
};
