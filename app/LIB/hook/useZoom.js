"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export function useZoom(minScale = 0.5, maxScale = 4, step = 0.1) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  // 휠 이벤트 (확대/축소) 로직만 남김
  const onWheel = useCallback(
    (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const delta = e.deltaY * -1;
      const newScale = scale + (delta > 0 ? step : -step);
      const clampedScale = Math.max(minScale, Math.min(newScale, maxScale));

      setScale(clampedScale);
    },
    [scale, minScale, maxScale, step]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", onWheel);
    return () => container.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  return { containerRef, scale };
}
