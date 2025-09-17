"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useUser } from "./UserContext";
import { createData, fetchDataList, updateData } from "../utils/dataUtils";

const MemoContext = createContext();

export function MemoProvider({ children }) {
  const [memo, setMemoState] = useState(null);
  // 1. 로딩 상태와 에러 상태 추가
  const [memoLoading, setMemoLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // 저장 상태 추가
  const [error, setError] = useState(null);

  const { user, userLoading } = useUser();
  const debounceTimeout = useRef(null);

  const fetchList = useCallback(async () => {
    if (!user) return;

    // 로딩 시작
    setMemoLoading(true);
    setError(null);

    // 2. try...catch로 API 호출 로직을 감싸 에러를 처리
    try {
      const memos = await fetchDataList("memo");

      if (memos && memos.content && memos.content.length > 0) {
        const userMemo = memos.content[0];
        setMemoState(userMemo);
      } else {
        const newMemoPayload = {
          memo: "",
          userId: user.uid
        };
        const newDoc = await createData("memo");
        const finalNewMemo = await updateData(
          "memo",
          newDoc._id,
          newMemoPayload
        );
        setMemoState(finalNewMemo);
      }
    } catch (e) {
      console.error("Failed to fetch or create memo:", e);
      setError(e); // 에러 상태 설정
    } finally {
      setMemoLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchList();
    } else if (!userLoading && !user) {
      setMemoLoading(false);
    }
  }, [userLoading, user, fetchList]);

  useEffect(() => {
    if (!memo?._id) {
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      updateData("memo", memo._id, memo)
        .then(() => {
          localStorage.setItem("memo", JSON.stringify(memo));
        })
        .catch((e) => console.error("Failed to auto-save memo:", e));
    }, 2000); // 기본 2초로 설정

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [memo]);

  const setMemo = (next) => {
    setMemoState((prev) => ({
      ...prev,
      ...(typeof next === "function" ? next(prev) : next)
    }));
  };

  // DocumentContext처럼 수동 저장하는 함수
  const saveMemo = useCallback(
    async (memoData) => {
      if (!user || !memo?._id || !memoData) return;

      setIsSaving(true);

      try {
        // DB에 업데이트
        await updateData("memo", memo._id, memoData);

        // React 상태도 업데이트
        setMemoState((prev) => ({
          ...prev,
          ...memoData
        }));
      } catch (error) {
        console.error("메모 저장 실패:", error);
        setError(error);
      } finally {
        setIsSaving(false);
      }
    },
    [user, memo]
  );

  const value = useMemo(
    () => ({
      memo,
      setMemo,
      saveMemo, // 수동 저장 함수 추가
      memoLoading, // 3. 외부에서 로딩 상태를 사용할 수 있도록 value에 추가
      isSaving, // 저장 상태 추가
      error
    }),
    [memo, saveMemo, memoLoading, isSaving, error]
  );

  return <MemoContext.Provider value={value}>{children}</MemoContext.Provider>;
}

export function useMemoContext() {
  const context = useContext(MemoContext);
  if (!context) {
    throw new Error("useMemoContext must be used within a MemoProvider");
  }
  return context;
}
