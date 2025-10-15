"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LayoutContext = createContext();

export function LayoutProvider({ children }) {
  // 1. 상태 변수를 더 명확하게 변경
  const [layoutMode, setLayoutMode] = useState("desktop"); // 'desktop', 'tablet', 'mobile'
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      const width = window.innerWidth;
      if (width > 1200) {
        setLayoutMode("desktop");
      } else if (width > 768) {
        setLayoutMode("tablet");
      } else {
        setLayoutMode("mobile");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. 패널을 보여줄지 최종적으로 결정하는 로직
  // 데스크톱일 때만 왼쪽 패널을 보여줌
  const showLeftPanel = layoutMode === "desktop" && isLeftPanelOpen;
  // 데스크톱 또는 태블릿일 때 오른쪽 패널을 보여줌
  const showRightPanel =
    (layoutMode === "desktop" || layoutMode === "tablet") && isRightPanelOpen;

  // 3. 외부에서 패널을 제어할 함수들
  const toggleLeftPanel = () => setIsLeftPanelOpen((prev) => !prev);
  const toggleRightPanel = () => setIsRightPanelOpen((prev) => !prev);

  // Hydration 오류 방지
  if (!mounted) {
    // 서버 사이드 렌더링 또는 초기 렌더링 시에는 UI를 렌더링하지 않음
    // 혹은 기본 레이아웃을 보여주는 스켈레톤 UI를 반환할 수도 있음
    return null;
  }

  return (
    <LayoutContext.Provider
      value={{
        layoutMode,
        showLeftPanel,
        showRightPanel,
        toggleLeftPanel,
        toggleRightPanel,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

// 4. Custom Hook 이름 변경
export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
