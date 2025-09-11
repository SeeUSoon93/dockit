"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { fetchUser } from "../utils/authUtils";
import { auth } from "../config/firebaseConfig";

const UserContext = createContext();
// 👇 localStorage 키를 상수로 관리하여 오타 방지 및 유지보수 용이성 확보
const CACHED_USER_KEY = "DOCKIT_USER";

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    setUserLoading(true);
    try {
      // authUtils의 fetchUser는 callApi를 사용하므로 토큰을 자동으로 포함합니다.
      const data = await fetchUser();
      setUser(data.user);
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(data.user));
    } catch (err) {
      console.error("사용자 정보 갱신 실패:", err);
      setUser(null);
      localStorage.removeItem(CACHED_USER_KEY);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    const cachedUser = localStorage.getItem(CACHED_USER_KEY);
    if (cachedUser && cachedUser !== "undefined") {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error("캐시된 사용자 JSON 파싱 오류:", e);
        localStorage.removeItem(CACHED_USER_KEY);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const data = await fetchUser();
          setUser(data.user);
          localStorage.setItem(CACHED_USER_KEY, JSON.stringify(data.user));
        } catch (err) {
          console.error("사용자 로드 실패:", err);
          setUser(null);
          localStorage.removeItem(CACHED_USER_KEY);
        }
      } else {
        setUser(null);
        localStorage.removeItem(CACHED_USER_KEY);
      }
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, userLoading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
