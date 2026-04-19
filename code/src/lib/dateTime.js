export function parseSupabaseDateTime(timestamp) {
  if (!timestamp) {
    return null;
  }

  if (timestamp instanceof Date) {
    return Number.isNaN(timestamp.getTime()) ? null : timestamp;
  }

  if (typeof timestamp !== "string") {
    return null;
  }

  const normalizedTimestamp = timestamp.trim().replace(" ", "T");
  const parsedDate = new Date(normalizedTimestamp);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}