// LIB/context/DocumentContext.js

"use client";

import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL
} from "firebase/storage";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect
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

  // ❗ 1. 저장 로직을 위한 ref들을 추가합니다.
  const isSavingRef = useRef(false); // 실제 저장 진행 상태 (Lock)
  const pendingPayloadRef = useRef(null); // 저장 중에 들어온 추가 요청 보관함

  useEffect(() => {
    latestStateRef.current = {
      title,
      content,
      docSetting,
      bulletStyle
    };
  }, [title, content, docSetting, bulletStyle]);

  const generateThumbnail = useCallback(async (htmlContent, docSettings) => {
    try {
      const response = await fetch("/api/generate-thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          html: htmlContent,
          settings: docSettings
        })
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
          paddingRight: 25.4
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

  const saveDocument = useCallback(
    async (id, payload = {}) => {
      const user = auth.currentUser;
      if (!user || !id) return;

      // A. 만약 이미 다른 저장이 진행 중이라면...
      if (isSavingRef.current) {
        // ...새로 들어온 변경사항을 '보관함'에 합쳐두고 함수를 즉시 종료합니다.
        pendingPayloadRef.current = {
          ...pendingPayloadRef.current,
          ...payload
        };
        return;
      }

      // B. 저장을 시작합니다. '문 잠금' 상태로 만들고 UI에 표시합니다.
      isSavingRef.current = true;
      setIsSaving(true);

      const latestState = latestStateRef.current;
      const dataToSave = {
        ...latestState,
        ...payload
      };
      const dataForDB = {
        title: dataToSave.title,
        docSetting: dataToSave.docSetting,
        bulletStyle: dataToSave.bulletStyle
      };

      try {
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
            content: dataToSave.content
          }));
        }
      } catch (error) {
        console.error("문서 저장 실패:", error);
      } finally {
        // C. 저장이 끝나면...
        const pendingPayload = pendingPayloadRef.current;
        pendingPayloadRef.current = null; // 일단 보관함은 비웁니다.

        // D. 만약 보관함에 다음 저장할 내용이 있다면...
        if (pendingPayload) {
          // ...'문 잠금'을 풀지 않고, 바로 다음 저장을 이어서 실행합니다.
          saveDocument(id, pendingPayload);
        } else {
          // ...보관함이 비어있다면, '문 잠금'을 풀고 UI 상태도 업데이트합니다.
          isSavingRef.current = false;
          setIsSaving(false);
        }
      }
    },
    [generateThumbnail]
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
    saveDocument
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
