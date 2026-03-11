export const styles = {
  container: ({ isAlignmentCenter }: { isAlignmentCenter: boolean }) => {
    return {
      width: "100%",
      height: "100%",
      display: "flex",
      // gap: "2em",
      flexDirection: "column",
      // marginTop: "2em",
    } as const;
  },
  innerRepeaterBlock: {
    display: "flex",
    gap: "2em",
    flexDirection: "column",
    paddingLeft: "1.25em",
    borderLeft: "0.375em solid var(--grey-lighten-4, #CFD8DC)",
  } as const,
};
