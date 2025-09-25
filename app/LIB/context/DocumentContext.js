// LIB/context/DocumentContext.js

"use client";

import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { fetchData, updateData } from "../utils/dataUtils"; // 데이터 관련 API 함수
import { auth } from "../config/firebaseConfig";

const DocumentContext = createContext();
const storage = getStorage(); // Storage 서비스 초기화

export function DocumentProvider({ children }) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [docSetting, setDocSetting] = useState(null);
  const [bulletStyle, setBulletStyle] = useState(null);
  const [contentURL, setContentURL] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const latestStateRef = useRef();

  // 저장 큐 시스템
  const saveQueue = useRef([]);
  const isProcessingQueue = useRef(false);

  useEffect(() => {
    latestStateRef.current = {
      title,
      content,
      docSetting,
      bulletStyle,
    };
  }, [title, content, docSetting, bulletStyle]);

  const generateThumbnail = useCallback(async (htmlContent, docSettings) => {
    try {
      const response = await fetch("/api/generate-thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: htmlContent,
          settings: docSettings,
        }),
      });

      if (!response.ok) {
        throw new Error("썸네일 생성 실패");
      }

      const data = await response.json();
      return data.thumbnail;
    } catch (error) {
      console.error("썸네일 생성 오류:", error);
      return null;
    }
  }, []);

  const loadDocument = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await fetchData("documents", id);
      let fetchedDoc = data.content;

      if (!fetchedDoc.docSetting) {
        const defaultSettings = {
          pageWidth: 210,
          pageHeight: 297,
          paddingTop: 25.4,
          paddingBottom: 25.4,
          paddingLeft: 25.4,
          paddingRight: 25.4,
        };

        fetchedDoc = { ...fetchedDoc, docSetting: defaultSettings };

        await updateData("documents", id, { docSetting: defaultSettings });
      }

      if (fetchedDoc.contentURL) {
        const response = await fetch(fetchedDoc.contentURL);
        const content = await response.text();
        setDocument({ ...fetchedDoc, content });
        setContent(content);
      } else {
        setDocument(fetchedDoc);
        setContent("");
      }
      setTitle(fetchedDoc.title || "");
      setDocSetting(fetchedDoc.docSetting || null);
      setBulletStyle(fetchedDoc.bulletStyle || null);
      setContentURL(fetchedDoc.contentURL || "");
      setThumbnail(fetchedDoc.thumbnail || null);
    } catch (error) {
      console.error("문서 로드 실패:", error);
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 큐 처리 함수
  const processSaveQueue = useCallback(
    async (id) => {
      if (isProcessingQueue.current || saveQueue.current.length === 0) return;

      isProcessingQueue.current = true;
      setIsSaving(true);

      try {
        // 큐의 모든 변경사항을 하나로 합침
        const mergedPayload = saveQueue.current.reduce(
          (acc, payload) => ({
            ...acc,
            ...payload,
          }),
          {}
        );

        const latestState = latestStateRef.current;
        const dataToSave = {
          ...latestState,
          ...mergedPayload,
        };

        const dataForDB = {
          title: dataToSave.title,
          docSetting: dataToSave.docSetting,
          bulletStyle: dataToSave.bulletStyle,
        };

        const user = auth.currentUser;
        if (!user) return;

        if (dataToSave.content) {
          const storageRef = ref(storage, `documents/${user.uid}/${id}.html`);
          await uploadString(storageRef, dataToSave.content, "raw", {});
          const downloadURL = await getDownloadURL(storageRef);
          dataForDB.contentURL = downloadURL;

          const thumbnailBase64 = await generateThumbnail(
            dataToSave.content,
            dataToSave.docSetting
          );
          if (thumbnailBase64) {
            dataForDB.thumbnail = thumbnailBase64;
          }
        }

        if (Object.keys(dataForDB).length > 0) {
          await updateData("documents", id, dataForDB);

          setDocument((prev) => ({
            ...prev,
            ...dataForDB,
            content: dataToSave.content,
          }));
        }
      } catch (error) {
        console.error("문서 저장 실패:", error);
      } finally {
        // 큐 비우기
        saveQueue.current = [];
        isProcessingQueue.current = false;
        setIsSaving(false);
      }
    },
    [generateThumbnail]
  );

  const saveDocument = useCallback(
    async (id, payload = {}) => {
      if (!id) return;

      // 큐에 추가
      saveQueue.current.push(payload);

      // 디바운스로 큐 처리
      setTimeout(() => {
        processSaveQueue(id);
      }, 1000); // 1초 후 저장
    },
    [processSaveQueue]
  );

  const clearDocument = useCallback(() => {
    setDocument(null);
  }, []);

  const value = {
    document,
    loading,
    isSaving,
    title,
    setTitle,
    content,
    setContent,
    docSetting,
    setDocSetting,
    bulletStyle,
    setBulletStyle,
    contentURL,
    setContentURL,
    thumbnail,
    setThumbnail,
    loadDocument,
    clearDocument,
    saveDocument,
  };
  // 주석
  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  return useContext(DocumentContext);
}
