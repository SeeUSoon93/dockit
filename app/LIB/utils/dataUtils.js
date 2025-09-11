import { API_BASE_URL } from "../config/config";
import { callApi } from "./apiUtils";

// CREATE
export const createData = async (contentType) => {
  return callApi(`${API_BASE_URL}/${contentType}/create`, { method: "POST" });
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

// READ ALL
export const fetchDataList = async (contentType) => {
  return callApi(`${API_BASE_URL}/${contentType}`, { method: "GET" });
};

// DELETE by ID
export const deleteData = async (contentType, docId) => {
  return callApi(`${API_BASE_URL}/${contentType}/delete/${docId}`, {
    method: "DELETE"
  });
};
