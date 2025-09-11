"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";

const PanelContext = createContext();

export function PanelProvider({ children, storageKey = "dockit.panels.v1" }) {
  const [mounted, setMounted] = useState(false);
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 복원 로직 (변경 없음)
  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.left)) setLeft(data.left);
      if (Array.isArray(data.right)) setRight(data.right);
    } catch (err) {
      console.error("Failed to restore panel state:", err);
    }
  }, [mounted, storageKey]);

  // 저장 로직 (변경 없음)
  useEffect(() => {
    if (!mounted) return;
    try {
      const data = { left, right };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to save panel state:", err);
    }
  }, [mounted, left, right, storageKey]);

  // --- 패널 추가/삭제 관련 유틸 함수 (DnD와 무관하므로 유지) ---

  const exists = useCallback(
    (type) => left.includes(type) || right.includes(type),
    [left, right]
  );

  const remove = useCallback((type) => {
    setLeft((prev) => prev.filter((t) => t !== type));
    setRight((prev) => prev.filter((t) => t !== type));
  }, []);

  const toggle = useCallback(
    (type) => {
      if (exists(type)) {
        remove(type);
      } else {
        // 기본적으로 오른쪽 패널에 추가
        setRight((prev) => [...prev, type]);
      }
    },
    [exists, remove]
  );

  return (
    <PanelContext.Provider
      value={{
        left,
        right,
        setLeft, // Workspace의 dnd-kit 핸들러가 직접 사용
        setRight, // Workspace의 dnd-kit 핸들러가 직접 사용
        toggle,
        remove,
        exists
      }}
    >
      {children}
    </PanelContext.Provider>
  );
}

export function usePanels() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanels must be used within a PanelProvider");
  return ctx;
}
