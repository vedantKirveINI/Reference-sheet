export const AddressAnswerRenderer = ({ value, style }) => {
  const response = value?.response || {};
  const inlineStyle = (style);
  return (
    <>
      <p style={inlineStyle}>Full Name: {response?.fullName}</p>
      <p style={inlineStyle}>Country: {response?.country}</p>
      <p style={inlineStyle}>Address Line 1: {response?.addressLineOne}</p>
      <p style={inlineStyle}>Address Line 2: {response?.addressLineTwo}</p>
      <p style={inlineStyle}>City: {response?.city}</p>
      <p style={inlineStyle}>Zip Code: {response?.zipCode}</p>
      <p style={inlineStyle}>State: {response?.state}</p>
    </>
  );
};
