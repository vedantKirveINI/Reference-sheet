const getAmount = (amount) => {
  if (!amount) {
    return 0;
  }
  amount = typeof amount === "string" ? parseFloat(amount) : amount;
  const amountInPaise = amount * 100;
  return amountInPaise;
};

export { getAmount };
