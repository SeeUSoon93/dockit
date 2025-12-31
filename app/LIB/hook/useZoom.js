"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export function useZoom(minScale = 0.5, maxScale = 4, step = 0.1) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  useEffect(() => {
    const blockBrowserZoom = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", blockBrowserZoom, {
      passive: false, // ❗ 필수
    });

    return () => {
      window.removeEventListener("wheel", blockBrowserZoom);
    };
  }, []);
  // 휠 이벤트 (확대/축소) 로직만 남김
  const onWheel = useCallback(
    (e) => {
      // Ctrl 키가 눌려있지 않으면 무시
      if (!e.ctrlKey) return;

      // 이벤트가 containerRef 내부에서 발생했는지 확인
      const container = containerRef.current;
      if (!container) return;

      // 이벤트 타겟이 container 내부에 있는지 확인
      if (!container.contains(e.target)) return;

      // 이벤트 전파 방지 및 기본 동작 방지
      e.preventDefault();
      e.stopPropagation();

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

    // capture phase에서 이벤트 리스너 추가하여 먼저 처리
    container.addEventListener("wheel", onWheel, { capture: true });
    return () =>
      container.removeEventListener("wheel", onWheel, { capture: true });
  }, [onWheel]);

  return { containerRef, scale };
}
