// LIB/context/DocumentContext.js

"use client";

import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL
} from "firebase/storage";

import { createContext, useContext, useState, useCallback } from "react";
import { fetchData, updateData } from "../utils/dataUtils"; // 데이터 관련 API 함수
import { auth } from "../config/firebaseConfig";

const DocumentContext = createContext();
const storage = getStorage(); // Storage 서비스 초기화

export function DocumentProvider({ children }) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ID로 문서를 불러오는 함수
  const loadDocument = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await fetchData("documents", id);
      let fetchedDoc = data.content;

      // docSetting이 없으면 기본값을 설정하고 DB에 저장하는 로직
      if (!fetchedDoc.docSetting) {
        const defaultSettings = {
          pageWidth: 210,
          pageHeight: 297,
          paddingTop: 25.4,
          paddingBottom: 25.4,
          paddingLeft: 25.4,
          paddingRight: 25.4
        };

        // 불러온 문서 객체에 기본 설정 추가
        fetchedDoc = { ...fetchedDoc, docSetting: defaultSettings };

        // 이 문서를 위해 기본 설정을 DB에 저장 (다음 로드부터는 이 값 사용)
        await updateData("documents", id, { docSetting: defaultSettings });
      }

      if (fetchedDoc.contentURL) {
        const response = await fetch(fetchedDoc.contentURL);
        const content = await response.text();
        setDocument({ ...fetchedDoc, content });
      } else {
        setDocument(fetchedDoc);
      }
    } catch (error) {
      console.error("문서 로드 실패:", error);
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 문서를 저장하는 함수
  const saveDocument = useCallback(async (id, docData) => {
    const user = auth.currentUser;
    if (!user || !id || !docData) return;

    setIsSaving(true);
    // 1. 저장할 데이터를 명확하게 분리합니다.
    const titleToSave = docData.title;
    const contentToSave = docData.content;
    const settingsToSave = docData.docSetting;

    // DB에 업데이트할 최종 데이터 객체
    const dataForDB = {};

    // 2. 제목이 있으면 DB에 업데이트할 내용에 추가
    if (typeof titleToSave !== "undefined") {
      dataForDB.title = titleToSave;
    }
    // [추가] docSetting이 있으면 DB에 업데이트할 내용에 추가
    if (typeof settingsToSave !== "undefined") {
      dataForDB.docSetting = settingsToSave;
    }

    try {
      // 3. 콘텐츠가 있으면 Storage에 업로드하고 DB 업데이트 내용에 URL 추가
      if (typeof contentToSave !== "undefined") {
        const storageRef = ref(storage, `documents/${user.uid}/${id}.html`);
        await uploadString(storageRef, contentToSave, "raw", {
          /*...*/
        });
        const downloadURL = await getDownloadURL(storageRef);
        dataForDB.contentURL = downloadURL;
      }

      // 4. DB에 한 번만 업데이트 요청
      if (Object.keys(dataForDB).length > 0) {
        await updateData("documents", id, dataForDB);

        // 5. React 상태도 업데이트
        setDocument((prev) => ({
          ...prev,
          title: titleToSave ?? prev.title, // 새로 저장한 title 우선 적용
          content: contentToSave ?? prev.content, // 새로 저장한 content 우선 적용
          docSetting: settingsToSave ?? prev.docSetting,
          contentURL: dataForDB.contentURL ?? prev.contentURL
        }));
      }
    } catch (error) {
      console.error("문서 저장 실패:", error);
    }
    setIsSaving(false);
  }, []);

  // 현재 문서를 비우는 함수
  const clearDocument = useCallback(() => {
    setDocument(null);
  }, []);

  const value = {
    document,
    loading,
    isSaving,
    loadDocument,
    clearDocument,
    saveDocument
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

// Custom Hook
export function useDocument() {
  return useContext(DocumentContext);
}
