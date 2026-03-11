const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (Number.isNaN(Number(phoneNumber))) return false;
  if (phoneNumber === null) return false;
  return phoneNumber.length === 7 || phoneNumber.length === 10;
};

export default isValidPhoneNumber;
