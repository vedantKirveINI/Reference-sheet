import InputGridV2 from "@oute/oute-ds.molecule.input-grid-v2";

const Configure = ({ inputGridRef, variables, data }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "1rem",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        overflow: "hidden",
        gap: "1rem",
      }}
    >
      <div style={{ overflow: "auto" }}>
        <InputGridV2
          ref={inputGridRef}
          variables={variables}
          initialValue={data}
          hideHeaderAndMap
          showNote={false}
        />
      </div>
    </div>
  );
};

export default Configure;
