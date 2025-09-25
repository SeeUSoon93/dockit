"use client";

import { createContext, useContext, useMemo } from "react";
import { useDataManagement } from "../hook/useDataManagement";

const DEFAULT_SETTING = {
  autoSave: false,
  autoSaveDelay: 2000,
};

const localStorageKey = "DOCKIT_SETTING";

const SettingContext = createContext();

export function SettingProvider({ children }) {
  const {
    data: setting,
    setData: setSetting,
    saveData: saveSetting,
    loading: settingLoading,
    isSaving,
    error,
  } = useDataManagement("setting", DEFAULT_SETTING, localStorageKey, 2000);

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
