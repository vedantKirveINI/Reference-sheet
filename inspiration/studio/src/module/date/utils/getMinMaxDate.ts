export const getMaxDate = (question) => {
  const allowFuture = question?.settings?.allowFutureDate;
  const endDateISOValue = question?.settings?.endDate?.ISOValue;
  if (allowFuture && endDateISOValue) {
    return endDateISOValue;
  }
  if (!allowFuture && !endDateISOValue) {
    return new Date().toISOString().split("T")[0];
  }
  if (!allowFuture && endDateISOValue) {
    const today = new Date();
    const endDate = new Date(endDateISOValue);
    if (today.getTime() > endDate.getTime()) {
      return endDateISOValue;
    }
    if (today.getTime() < endDate.getTime()) {
      return new Date().toISOString().split("T")[0];
    }
  }
  return null;
};

export const getMinDate = (question) => {
  const allowPast = question?.settings?.allowPastDate;
  const startDateISOValue = question?.settings?.startDate?.ISOValue;
  if (!allowPast && !startDateISOValue) {
    return new Date().toISOString().split("T")[0];
  }
  if (allowPast && startDateISOValue) {
    return startDateISOValue;
  }
  if (!allowPast && startDateISOValue) {
    const today = new Date();
    const startDate = new Date(startDateISOValue);
    if (today.getTime() > startDate.getTime()) {
      return new Date().toISOString().split("T")[0];
    }
    if (today.getTime() < startDate.getTime()) {
      return startDateISOValue;
    }
  }
  return null;
};
