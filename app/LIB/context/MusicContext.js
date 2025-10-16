"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [natureMusic, setNatureMusic] = useState([]);
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Firebase Storage에서 음악 파일 목록 가져오기
  const fetchMusicFiles = async (category) => {
    try {
      setLoading(true);
      setError(null);

      const storage = getStorage();
      const categoryRef = ref(storage, `music/${category}`);

      const result = await listAll(categoryRef);

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

          // 같은 이름의 jpg 파일 찾기
          let thumbnailUrl = null;
          try {
            const fileName = itemRef.name.replace(/\.[^/.]+$/, ""); // 확장자 제거
            const thumbnailRef = ref(
              storage,
              `music/${category}/${fileName}.jpg`
            );
            thumbnailUrl = await getDownloadURL(thumbnailRef);
          } catch (error) {}

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
    loadAllMusic();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
