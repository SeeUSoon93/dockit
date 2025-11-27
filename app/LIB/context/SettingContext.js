"use client";

import { createContext, useContext, useMemo } from "react";
import { useDataManagement } from "../hook/useDataManagement";

const DEFAULT_SETTING = {
  autoSave: false,
  autoSaveDelay: 2000,
  workspaceWidth: 800,
  panelLeft: 350,
  panelRight: 350,
};

const localStorageKey = "DOCKIT_SETTING";

const SettingContext = createContext();

export function SettingProvider({ children }) {
  const {
    data: rawSetting,
    setData: setSetting,
    saveData: saveSetting,
    loading: settingLoading,
    isSaving,
    error,
  } = useDataManagement("setting", DEFAULT_SETTING, localStorageKey, 2000);

  // 숫자 값들을 보장
  const setting = useMemo(() => {
    // 로딩 중이거나 데이터가 없으면 null 반환
    if (settingLoading || !rawSetting) return null;

    const parseValue = (value, fallback) => {
      const parsed = parseFloat(value);
      // 숫자가 아니면(NaN) fallback 반환, 숫자면(0 포함) parsed 반환
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    return {
      ...rawSetting,
      autoSaveDelay:
        Number(rawSetting.autoSaveDelay) || DEFAULT_SETTING.autoSaveDelay,
      workspaceWidth:
        Number(rawSetting.workspaceWidth) || DEFAULT_SETTING.workspaceWidth,
      // float로 변환
      panelLeft: parseValue(rawSetting.panelLeft, DEFAULT_SETTING.panelLeft),
      panelRight: parseValue(rawSetting.panelRight, DEFAULT_SETTING.panelRight),
    };
  }, [rawSetting, settingLoading]);

  const value = useMemo(
    () => ({
      setting: setting || DEFAULT_SETTING, // null이면 기본값 사용
      setSetting,
      saveSetting,
      settingLoading,
      isSaving,
      error,
    }),
    [setting, setSetting, saveSetting, settingLoading, isSaving, error]
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
