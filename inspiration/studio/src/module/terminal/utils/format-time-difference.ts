export function formatTimeFromMs(diffInMs: number = 0): string {
  if (Number.isNaN(diffInMs)) {
    return "0 ms";
  }
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(diffInMs / 60000);
  const hours = Math.floor(diffInMs / 3600000);

  if (diffInMs < 1000) {
    return `${diffInMs} ms`;
  } else if (seconds < 60) {
    return `${seconds} sec`;
  } else if (minutes < 60) {
    return `${minutes} min`;
  } else {
    return `${hours} hr`;
  }
}

export function formatTimeDifference(
  date1: string | Date,
  date2: string | Date
) {
  try {
    const start = new Date(date1);
    const end = new Date(date2);

    if (!start || !end) {
      return null;
    }

    const diffInMs = end.getTime() - start.getTime();
    return formatTimeFromMs(diffInMs);
  } catch (error) {
    return null;
  }
}
