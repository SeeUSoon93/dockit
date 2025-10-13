import { API_BASE_URL } from "../config/config";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  deleteUser,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { callApi } from "./apiUtils";

// 1. 구글 로그인 or 가입
export const handleGoogleAuth = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    return callApi(`${API_BASE_URL}/users/google_auth`, { method: "POST" });
  } catch (e) {
    console.error("구글 인증 실패:", e);
    throw e;
  }
};

// 2. 회원 정보 가져오기
export const fetchUser = async () => {
  return callApi(`${API_BASE_URL}/users/me`, { method: "GET" });
};

// 3. 로그아웃
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("로그아웃 실패:", e);
  }
};

// 4. 회원탈퇴 (Firebase + FastAPI)
export const handleDeleteUser = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("로그인된 사용자가 없습니다");

    // 1. Firebase에서 계정 삭제
    await deleteUser(user);

    // 2. 서버에 삭제 요청
    return callApi(`${API_BASE_URL}/users/me`, { method: "DELETE" });
  } catch (e) {
    console.error("회원 탈퇴 중 오류:", e);
    throw e;
  }
};

// 5. 포인트 갱신
export const refreshUserPoint = async (data) => {
  return callApi(`${API_BASE_URL}/users/me/points`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};
