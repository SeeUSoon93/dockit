"use client";

import { createContext, useContext, useMemo } from "react";
import { useDataManagement } from "../hook/useDataManagement";

const CharContext = createContext();

const DEFAULT_CHAR = {
  char: [
    { key: "·", char: "·" },
    { key: "「", char: "「" },
    { key: "」", char: "」" },
    { key: "『", char: "『" },
    { key: "』", char: "』" },
    { key: "《", char: "《" },
    { key: "》", char: "》" },
    { key: "〈", char: "〈" },
    { key: "〉", char: "〉" },
    { key: "【", char: "【" },
    { key: "】", char: "】" },
    { key: "±", char: "±" },
    { key: "×", char: "×" },
    { key: "÷", char: "÷" },
    { key: "≠", char: "≠" },
    { key: "≤", char: "≤" },
    { key: "≥", char: "≥" },
    { key: "→", char: "→" },
    { key: "←", char: "←" },
    { key: "↑", char: "↑" },
    { key: "↓", char: "↓" },
  ],
};

export function CharProvider({ children }) {
  const {
    data: char,
    setData: setChar,
    saveData: saveChar,
    loading: charLoading,
    isSaving,
    error,
  } = useDataManagement("char", DEFAULT_CHAR, "dockit.char.v1", 2000);

  const value = useMemo(
    () => ({
      char: char || DEFAULT_CHAR, // null이면 기본값 사용
      setChar,
      saveChar,
      charLoading,
      isSaving,
      error,
    }),
    [char, setChar, saveChar, charLoading, isSaving, error]
  );

  return <CharContext.Provider value={value}>{children}</CharContext.Provider>;
}

export function useCharContext() {
  const context = useContext(CharContext);
  if (!context) {
    throw new Error("useCharContext must be used within a CharProvider");
  }
  return context;
}
