"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { useUser } from "./UserContext";

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [natureMusic, setNatureMusic] = useState([]);
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, userLoading } = useUser();

  // Firebase Storage에서 음악 파일 목록 가져오기
  const fetchMusicFiles = async (category) => {
    try {
      setLoading(true);
      setError(null);

      const storage = getStorage();
      const categoryRef = ref(storage, `music/${category}`);

      const result = await listAll(categoryRef);

      // 이미지 파일 목록을 미리 생성 (썸네일 존재 여부 확인용)
      const imageFiles = new Set();
      result.items.forEach((itemRef) => {
        const name = itemRef.name.toLowerCase();
        if (
          name.endsWith(".jpg") ||
          name.endsWith(".jpeg") ||
          name.endsWith(".png")
        ) {
          // 확장자 제거한 파일명으로 저장
          const fileNameWithoutExt = itemRef.name.replace(/\.[^/.]+$/, "");
          imageFiles.add(fileNameWithoutExt.toLowerCase());
        }
      });

      const musicFiles = await Promise.all(
        result.items.map(async (itemRef) => {
          // 이미지 파일이면 건너뛰기
          if (
            itemRef.name.toLowerCase().endsWith(".jpg") ||
            itemRef.name.toLowerCase().endsWith(".jpeg") ||
            itemRef.name.toLowerCase().endsWith(".png")
          ) {
            return null;
          }

          const downloadURL = await getDownloadURL(itemRef);

          // 같은 이름의 jpg 파일 찾기 (목록에 있는 경우에만 요청)
          let thumbnailUrl = null;
          const fileName = itemRef.name.replace(/\.[^/.]+$/, ""); // 확장자 제거

          // 썸네일이 실제로 존재하는지 확인 후에만 다운로드 URL 가져오기
          if (imageFiles.has(fileName.toLowerCase())) {
            try {
              const thumbnailRef = ref(
                storage,
                `music/${category}/${fileName}.jpg`
              );
              thumbnailUrl = await getDownloadURL(thumbnailRef);
            } catch (error) {
              // 파일 목록에는 있지만 다운로드 실패한 경우 (드물게 발생)
              console.warn(`썸네일 다운로드 실패: ${fileName}.jpg`, error);
            }
          }

          return {
            name: itemRef.name,
            url: downloadURL,
            fullPath: itemRef.fullPath,
            thumbnailUrl,
          };
        })
      );

      // null 값 제거 (이미지 파일들)
      return musicFiles.filter((file) => file !== null);
    } catch (error) {
      console.error(`음악 파일 로드 실패 (${category}):`, error);
      setError(`음악 파일을 불러오는데 실패했습니다: ${error.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // nature 음악 파일 로드
  const loadNatureMusic = async () => {
    const files = await fetchMusicFiles("nature");
    setNatureMusic(files);
  };

  // music 음악 파일 로드
  const loadMusicList = async () => {
    const files = await fetchMusicFiles("music");
    setMusicList(files);
  };

  // 모든 음악 파일 로드
  const loadAllMusic = async () => {
    await Promise.all([loadNatureMusic(), loadMusicList()]);
  };

  // 컴포넌트 마운트 시 음악 파일 로드
  useEffect(() => {
    if (!user || userLoading) return;
    loadAllMusic();
  }, [user, userLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    natureMusic,
    musicList,
    loading,
    error,
    loadNatureMusic,
    loadMusicList,
    loadAllMusic,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
