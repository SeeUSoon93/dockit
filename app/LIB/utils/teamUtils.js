import { API_BASE_URL } from "../config/config";
import { callApi } from "./apiUtils";

// 회원 목록 가져오기
export const fetchUserList = async () => {
  //   console.log("fetchUserList 시작, API_BASE_URL:", API_BASE_URL);
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL이 설정되지 않았습니다.");
  }
  const url = `${API_BASE_URL}/users/user_list`;
  //   console.log("요청 URL:", url);
  return callApi(url, { method: "GET" });
};
