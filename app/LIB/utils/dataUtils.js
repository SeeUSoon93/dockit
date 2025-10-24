import { API_BASE_URL } from "../config/config";
import { callApi } from "./apiUtils";

// CREATE
export const createData = async (contentType, parentId = null, data = {}) => {
  const payload = {
    ...data,
    ...(parentId && { parent_id: parentId })
  };
  return callApi(`${API_BASE_URL}/${contentType}/create`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

// UPDATE
export const updateData = async (contentType, docId, doc) => {
  return callApi(`${API_BASE_URL}/${contentType}/update/${docId}`, {
    method: "PUT",
    body: JSON.stringify(doc)
  });
};

// READ ONE by ID
export const fetchData = async (contentType, docId) => {
  return callApi(`${API_BASE_URL}/${contentType}/get/${docId}`, {
    method: "GET"
  });
};

// READ ALL with pagination and folder support
export const fetchDataList = async (
  contentType,
  parentId = null,
  page = 1,
  limit = 100
) => {
  const params = new URLSearchParams();
  if (parentId !== null) params.append("parent_id", parentId);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  return callApi(`${API_BASE_URL}/${contentType}?${params.toString()}`, {
    method: "GET"
  });
};

// DELETE by ID
export const deleteData = async (contentType, docId) => {
  return callApi(`${API_BASE_URL}/${contentType}/delete/${docId}`, {
    method: "DELETE"
  });
};

// READ TREE - 사이드바용 전체 트리 구조
export const fetchDataTree = async (contentType = "tree") => {
  return callApi(`${API_BASE_URL}/${contentType}`, { method: "GET" });
};

// MOVE - 폴더/문서 이동
export const moveData = async (contentType, docId, newParentId = null) => {
  const params = new URLSearchParams();
  if (newParentId !== null) params.append("new_parent_id", newParentId);

  return callApi(
    `${API_BASE_URL}/${contentType}/move/${docId}?${params.toString()}`,
    {
      method: "PUT"
    }
  );
};

// Convert File to HTML
export const convertFileToHtml = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await fetch(`${API_BASE_URL}/file/convert`, {
    method: "POST",
    body: formData
  });
};
