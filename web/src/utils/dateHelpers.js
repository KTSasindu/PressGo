export const formatRelativeTime = (value, nowValue = Date.now()) => {
  if (!value) {
    return "N/A";
  }

  const timestamp =
    value instanceof Date ? value.getTime() : new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "N/A";
  }

  const now =
    nowValue instanceof Date ? nowValue.getTime() : new Date(nowValue).getTime();
  const diffInSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffInSeconds < 10) {
    return "Just now";
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  if (diffInHours < 48) {
    return "Yesterday";
  }

  return new Date(timestamp).toLocaleDateString("en-LK", {
    dateStyle: "medium",
  });
};

export const formatTimestamp = (value, fallback = "N/A") =>
  value
    ? new Date(value).toLocaleString("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : fallback;
