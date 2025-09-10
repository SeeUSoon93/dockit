import { API_BASE_URL } from "../config/config";
import { callApi } from "./apiUtils";

// 문서 생성
export const createData = async (contentType) => {
  return callApi(`${API_BASE_URL}/${contentType}/create`, { method: "POST" });
};

// 문서 저장
export const updateData = async (contentType, docId, doc) => {
  return callApi(`${API_BASE_URL}/${contentType}/update/${docId}`, {
    method: "PUT",
    body: JSON.stringify(doc)
  });
};

// id로 문서 불러오기
export const fetchData = async (contentType, docId) => {
  return callApi(`${API_BASE_URL}/${contentType}/get/${docId}`, {
    method: "GET"
  });
};

// 전체 문서 불러오기
export const fetchDataList = async (contentType) => {
  return callApi(`${API_BASE_URL}/${contentType}`, { method: "GET" });
};

// id로 문서 삭제
export const deleteData = async (contentType, docId) => {
  return callApi(`${API_BASE_URL}/${contentType}/delete/${docId}`, {
    method: "DELETE"
  });
};
