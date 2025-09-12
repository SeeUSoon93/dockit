"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DEFAULT_SETTING = {
  autoSaveDelay: 2000,
  pageSize: { width: 210, height: 297 },
  pagePadding: { top: 30, bottom: 25.4, left: 25.4, right: 25.4 },
  showPageNumber: true,
  pageNumberPosition: "bottom-right" // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
};

const LOCAL_STORAGE_KEY = "DOCKIT.PAGE.Setting";

const SettingContext = createContext();

export function SettingProvider({ children }) {
  const [setting, setSettingState] = useState(DEFAULT_SETTING);

  // ✅ localStorage에서 초기값 불러오기
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSettingState({ ...DEFAULT_SETTING, ...parsed });
      } catch (e) {
        console.warn("설정 로딩 실패:", e);
      }
    }
  }, []);

  // ✅ 변경될 때마다 localStorage 저장
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(setting));
  }, [setting]);

  const setSetting = (next) => {
    setSettingState((prev) => ({
      ...prev,
      ...next
    }));
  };
  const value = useMemo(
    () => ({
      setting,
      setSetting
    }),
    [setting]
  );

  return (
    <SettingContext.Provider value={value}>{children}</SettingContext.Provider>
  );
}

export function useSetting() {
  const context = useContext(SettingContext);
  if (!context) {
    throw new Error("useSetting must be used within a SettingProvider");
  }
  return context;
}
