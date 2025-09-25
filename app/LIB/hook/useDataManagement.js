import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUser } from "../context/UserContext";
import { createData, fetchDataList, updateData } from "../utils/dataUtils";

/**
 * 공통 데이터 관리 훅
 * @param {string} endpoint - API 엔드포인트 (예: "memo", "setting")
 * @param {object} defaultData - 기본 데이터
 * @param {string} localStorageKey - localStorage 키
 * @param {number} autoSaveDelay - 자동 저장 지연 시간 (ms)
 */
export function useDataManagement(
  endpoint,
  defaultData,
  localStorageKey,
  autoSaveDelay = 2000
) {
  const [data, setDataState] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const { user, userLoading } = useUser();
  const debounceTimeout = useRef(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchDataList(endpoint);

      if (response && response.content && response.content.length > 0) {
        const userData = response.content[0];
        setDataState(userData);
        if (localStorageKey) {
          localStorage.setItem(localStorageKey, JSON.stringify(userData));
        }
      } else {
        const newDataPayload = {
          ...defaultData,
          userId: user.uid,
        };
        const newDoc = await createData(endpoint);
        const finalNewData = await updateData(
          endpoint,
          newDoc._id,
          newDataPayload
        );
        setDataState(finalNewData);
        if (localStorageKey) {
          localStorage.setItem(localStorageKey, JSON.stringify(finalNewData));
        }
      }
    } catch (e) {
      console.error(`Failed to fetch or create ${endpoint}:`, e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [user, endpoint, defaultData, localStorageKey]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchData();
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [userLoading, user, fetchData]);

  // 자동 저장 로직
  useEffect(() => {
    if (!data?._id) {
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      updateData(endpoint, data._id, data)
        .then(() => {
          if (localStorageKey) {
            localStorage.setItem(localStorageKey, JSON.stringify(data));
          }
        })
        .catch((e) => console.error(`Failed to auto-save ${endpoint}:`, e));
    }, autoSaveDelay);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [data, endpoint, localStorageKey, autoSaveDelay]);

  const setData = (next) => {
    setDataState((prev) => ({
      ...prev,
      ...(typeof next === "function" ? next(prev) : next),
    }));
  };

  // 수동 저장 함수
  const saveData = useCallback(
    async (dataToSave) => {
      if (!user || !data?._id || !dataToSave) return;

      setIsSaving(true);

      try {
        await updateData(endpoint, data._id, dataToSave);
        setDataState((prev) => ({
          ...prev,
          ...dataToSave,
        }));
      } catch (error) {
        console.error(`${endpoint} 저장 실패:`, error);
        setError(error);
      } finally {
        setIsSaving(false);
      }
    },
    [user, data, endpoint]
  );

  const value = useMemo(
    () => ({
      data,
      setData,
      saveData,
      loading,
      isSaving,
      error,
    }),
    [data, setData, saveData, loading, isSaving, error]
  );

  return value;
}
