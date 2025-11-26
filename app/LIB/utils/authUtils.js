import { API_BASE_URL } from "../config/config";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  deleteUser,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { callApi, getIdToken } from "./apiUtils";

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

// 6. 테스트 계정 자동로그인(설정한 이메일과 비밀번호)
export const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      "test@dockit.kr",
      "dockit"
    );

    const { uid, email: userEmail } = userCredential.user;
    const displayName = userCredential.user.displayName || "테스터";

    // 3. callApi 사용 (토큰 추출, 헤더 설정 자동화)
    return await callApi(`${API_BASE_URL}/users/test_login`, {
      method: "POST",
      body: JSON.stringify({
        uid,
        email: userEmail,
        display_name: displayName,
      }),
    });
  } catch (e) {
    console.error("테스트 로그인 실패:", e);
    throw e;
  }
};
