"use client";

import { createContext, useContext, useState, useCallback } from "react";

const DrawerContext = createContext();

export function DrawerProvider({ children }) {
  const [openLeftDrawer, setOpenLeftDrawer] = useState(false);
  const [openWidgetDrawer, setOpenWidgetDrawer] = useState(false);
  const [openSettingsDrawer, setOpenSettingsDrawer] = useState(false);

  // 개별 드로어 토글 함수들
  const toggleLeftDrawer = useCallback(() => {
    setOpenLeftDrawer((prev) => !prev);
  }, []);

  const toggleWidgetDrawer = useCallback(() => {
    setOpenWidgetDrawer((prev) => !prev);
  }, []);

  const toggleSettingsDrawer = useCallback(() => {
    setOpenSettingsDrawer((prev) => !prev);
  }, []);

  // 모든 드로어 닫기
  const closeAllDrawers = useCallback(() => {
    setOpenLeftDrawer(false);
    setOpenWidgetDrawer(false);
    setOpenSettingsDrawer(false);
  }, []);

  // 특정 드로어만 열기 (다른 드로어는 닫기)
  const openOnlyLeftDrawer = useCallback(() => {
    setOpenLeftDrawer(true);
    setOpenWidgetDrawer(false);
    setOpenSettingsDrawer(false);
  }, []);

  const openOnlyWidgetDrawer = useCallback(() => {
    setOpenLeftDrawer(false);
    setOpenWidgetDrawer(true);
    setOpenSettingsDrawer(false);
  }, []);

  const openOnlySettingsDrawer = useCallback(() => {
    setOpenLeftDrawer(false);
    setOpenWidgetDrawer(false);
    setOpenSettingsDrawer(true);
  }, []);

  const value = {
    // 상태
    openLeftDrawer,
    openWidgetDrawer,
    openSettingsDrawer,

    // 세터
    setOpenLeftDrawer,
    setOpenWidgetDrawer,
    setOpenSettingsDrawer,

    // 토글 함수들
    toggleLeftDrawer,
    toggleWidgetDrawer,
    toggleSettingsDrawer,

    // 유틸리티 함수들
    closeAllDrawers,
    openOnlyLeftDrawer,
    openOnlyWidgetDrawer,
    openOnlySettingsDrawer,
  };

  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
}

export function useDrawerContext() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawerContext must be used within a DrawerProvider");
  }
  return context;
}
