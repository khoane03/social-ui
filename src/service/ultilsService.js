function formatTime(date) {
    if (!date) return "";
    const updatedDate = new Date(date);
    const now = new Date();
    const diffMs = now - updatedDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    if (diffMins < 60) return `${diffMins} phút trước`;
    else if (diffHours < 24) return `${diffHours} giờ trước`;
    else if (diffHours < 48) return "Hôm qua";
    else
      return updatedDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
  }
export {
    formatTime
};