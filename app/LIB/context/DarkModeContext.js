"use client";

import { createContext, useContext, useEffect, useState } from "react";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  // 내부 로직은 'theme'으로 관리
  const [theme, setTheme] = useState("system");
  // 외부에 노출할 최종 상태
  const [isDarkMode, setIsDarkModeState] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 저장된 테마가 있으면 가져오고, 없으면 'system'으로 시작
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      const isSystemDark = mediaQuery.matches;
      const shouldBeDark =
        theme === "dark" || (theme === "system" && isSystemDark);

      setIsDarkModeState(shouldBeDark);

      if (shouldBeDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    updateTheme();

    const listener = () => updateTheme();
    mediaQuery.addEventListener("change", listener);

    if (theme !== "system") {
      localStorage.setItem("theme", theme);
    } else {
      localStorage.removeItem("theme");
    }

    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  const setIsDarkMode = (isDark) => {
    setTheme(isDark ? "dark" : "light");
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
}
