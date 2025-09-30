"use client";

import { createContext, useContext, useMemo } from "react";
import { useDataManagement } from "../hook/useDataManagement";

const DEFAULT_SETTING = {
  autoSave: false,
  autoSaveDelay: 2000,
  workspaceWidth: 800,
  panelWidth: 350,
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
    if (!rawSetting) return DEFAULT_SETTING;

    return {
      ...rawSetting,
      autoSaveDelay:
        Number(rawSetting.autoSaveDelay) || DEFAULT_SETTING.autoSaveDelay,
      workspaceWidth:
        Number(rawSetting.workspaceWidth) || DEFAULT_SETTING.workspaceWidth,
      panelWidth: Number(rawSetting.panelWidth) || DEFAULT_SETTING.panelWidth,
    };
  }, [rawSetting]);

  const value = useMemo(
    () => ({
      setting,
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
