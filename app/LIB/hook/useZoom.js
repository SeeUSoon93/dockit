"use client";

import { useState, useEffect, useRef } from "react";

export function useZoom(minScale = 0.5, maxScale = 4, step = 0.1) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        // 1. [가장 중요] 전역에서 브라우저 줌을 무조건 막음
        e.preventDefault();

        // 2. 휠 방향 계산
        const delta = e.deltaY * -1;

        setScale((prev) => {
          const next = prev + (delta > 0 ? step : -step);
          return Math.max(minScale, Math.min(next, maxScale));
        });
      }
    };

    // 3. 특정 div가 아니라 window에 리스너를 등록해서 브라우저가 개입할 틈을 안 줌
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [minScale, maxScale, step]); // 여기도 scale은 빼야 리스너가 안 꼬입니다.

  return { containerRef, scale };
}
