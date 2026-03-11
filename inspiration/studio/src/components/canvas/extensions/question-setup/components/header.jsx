const getTitleStyles = () => {
  return {
    fontFamily: "Helvetica Neue",
    fontWeight: "400",
    fontSize: "1.25em",
    color: "#000000",
    marginLeft: 10,
  };
};

const Header = ({ title, icon }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontSize: 14,
        height: "40px",
      }}
    >
      <img src={icon} />
      <div style={getTitleStyles()}>{title}</div>
    </div>
  );
};
export default Header;
