import { auth } from "../config/firebaseConfig";

export const getIdToken = async (forceRefresh = false) => {
  try {
    const user = auth.currentUser;
    // 1. 로그인된 사용자가 없는 경우
    if (!user) {
      throw new Error("로그인된 사용자가 없습니다.");
    }
    // 2. 사용자가 비활성화된 경우
    if (user.disabled) {
      throw new Error("비활성화된 사용자입니다.");
    }
    // 3. 토큰 발급
    const token = await user.getIdToken(forceRefresh);
    return token;
  } catch (error) {
    console.error("토큰 가져오기 실패:", error);
    throw error;
  }
};

export const callApi = async (url, options) => {
  const token = await getIdToken();
  if (!token) throw new Error("로그인된 사용자가 없습니다.");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API 호출 실패: ${response.status}`);
  }

  return await response.json();
};
