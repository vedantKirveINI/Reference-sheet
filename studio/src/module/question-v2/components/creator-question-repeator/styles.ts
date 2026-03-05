export const styles = {
  container: ({ isAlignmentCenter }: { isAlignmentCenter: boolean }) => {
    return {
      width: "100%",
      height: "100%",
      display: "flex",
      gap: "2em",
      flexDirection: "column",
      marginTop: "2em",
    } as const;
  },
};
