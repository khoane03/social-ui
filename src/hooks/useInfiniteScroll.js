import { useEffect, useCallback } from "react";

export default function useInfiniteScroll({
  hasNextPage,
  isLoading,
  threshold = 300,
  onLoadMore
}) {
  const handleScroll = useCallback(() => {
    if (!hasNextPage || isLoading) return;

    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;

    const distanceToBottom = fullHeight - (scrollTop + viewportHeight);

    if (distanceToBottom < threshold) {
      onLoadMore();
    }
  }, [hasNextPage, isLoading, threshold, onLoadMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
}
