export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

export function formatUsageText(usage?: { workflows: number; forms: number }): string {
  if (!usage) return "";
  
  const workflowText = `${usage.workflows} workflow${usage.workflows !== 1 ? "s" : ""}`;
  const formText = `${usage.forms} form${usage.forms !== 1 ? "s" : ""}`;
  
  if (usage.workflows === 0 && usage.forms === 0) {
    return "Not used yet";
  }
  
  return `Used in ${workflowText}, ${formText}`;
}
