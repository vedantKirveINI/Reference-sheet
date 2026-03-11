const Loading = ({ dataTestId }) => {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        alignItems: "center",
        justifyContent: "center",
      }}
      data-testid={dataTestId ?? ""}
    >
      <img
        src={
          "https://cdn-v1.tinycommand.com/1234567890/1753683887203/Circle%20Loader%20%283%29.gif"
        }
        style={{ height: "6.25rem" }}
        data-testid={dataTestId ? `${dataTestId}-loader` : ""}
      />
      <p
        style={{ fontSize: "1rem" }}
        data-testid={dataTestId ? `${dataTestId}-text` : ""}
      >
        Loading images please wait...
      </p>
    </div>
  );
};

export default Loading;
