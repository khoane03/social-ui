import { useEffect, useCallback, useRef } from "react";

export default function useInfiniteScroll({
  hasNextPage,
  isLoading,
  threshold = 300,
  onLoadMore,
  containerRef = null // thêm để hỗ trợ scroll trong container riêng
}) {
  const isFetchingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isLoading || isFetchingRef.current) return;

    const scrollElement = containerRef?.current || window;
    const isWindow = scrollElement === window;

    let scrollTop, viewportHeight, fullHeight;

    if (isWindow) {
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      viewportHeight = window.innerHeight;
      fullHeight = document.documentElement.scrollHeight;
    } else {
      scrollTop = scrollElement.scrollTop;
      viewportHeight = scrollElement.clientHeight;
      fullHeight = scrollElement.scrollHeight;
    }

    const distanceToBottom = fullHeight - (scrollTop + viewportHeight);

    if (distanceToBottom < threshold) {
      isFetchingRef.current = true;
      onLoadMore();
      
      // Reset flag sau 1s để tránh gọi liên tục
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 1000);
    }
  }, [hasNextPage, isLoading, threshold, onLoadMore, containerRef]);

  useEffect(() => {
    const scrollElement = containerRef?.current || window;

    scrollElement.addEventListener("scroll", handleScroll);
    
    // Gọi handleScroll 1 lần khi mount để load nếu màn hình lớn
    handleScroll();

    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [handleScroll, containerRef]);
}