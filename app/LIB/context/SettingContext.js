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

const DEFAULT_SETTING = {
  autoSave: false,
  autoSaveDelay: 2000
};

const localStorageKey = "DOCKIT_SETTING";

const SettingContext = createContext();

export function SettingProvider({ children }) {
  const [setting, setSettingState] = useState(DEFAULT_SETTING);
  // 1. 로딩 상태와 에러 상태 추가
  const [settingLoading, setSettingLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, userLoading } = useUser();
  const debounceTimeout = useRef(null);

  const fetchList = useCallback(async () => {
    if (!user) return;

    // 로딩 시작
    setSettingLoading(true);
    setError(null);

    // 2. try...catch로 API 호출 로직을 감싸 에러를 처리
    try {
      const settings = await fetchDataList("setting");

      if (settings && settings.content && settings.content.length > 0) {
        const userSetting = settings.content[0];
        setSettingState(userSetting);
        localStorage.setItem(localStorageKey, JSON.stringify(userSetting));
      } else {
        const newSettingPayload = {
          ...DEFAULT_SETTING,
          userId: user.uid
        };
        const newDoc = await createData("setting");
        const finalNewSetting = await updateData(
          "setting",
          newDoc._id,
          newSettingPayload
        );
        setSettingState(finalNewSetting);
        localStorage.setItem(localStorageKey, JSON.stringify(finalNewSetting));
      }
    } catch (e) {
      console.error("Failed to fetch or create setting:", e);
      setError(e); // 에러 상태 설정
    } finally {
      // 성공하든 실패하든 로딩 상태는 종료
      setSettingLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchList();
    } else if (!userLoading && !user) {
      // 로그아웃했거나 사용자가 없는 경우 로딩 종료
      setSettingLoading(false);
    }
  }, [userLoading, user, fetchList]);

  useEffect(() => {
    if (!setting._id) {
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      // 자동 저장 시에도 에러가 발생할 수 있으므로 catch 추가
      updateData("setting", setting._id, setting)
        .then(() => {
          localStorage.setItem(localStorageKey, JSON.stringify(setting));
        })
        .catch((e) => console.error("Failed to auto-save setting:", e));
    }, setting.autoSaveDelay || DEFAULT_SETTING.autoSaveDelay);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [setting]);

  const setSetting = (next) => {
    setSettingState((prev) => ({
      ...prev,
      ...(typeof next === "function" ? next(prev) : next)
    }));
  };

  const value = useMemo(
    () => ({
      setting,
      setSetting,
      settingLoading, // 3. 외부에서 로딩 상태를 사용할 수 있도록 value에 추가
      error
    }),
    [setting, settingLoading, error]
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
