import { Button, DotSpinner, Image, Input, Typography } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { inputProps } from "../../constant/uiProps";
import { useState } from "react";
import { MdImageSearch } from "react-icons/md";

const NEXT_PUBLIC_UNSPLASH_ACCESS_KEY =
  process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
export default function ImageSearch({ dragHandleProps }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allResults, setAllResults] = useState([]);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    imageUrl: "",
    imageId: ""
  });

  const handleAPI = async (page = 1) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    if (page === 1) {
      setResult(null);
      setAllResults([]);
    }
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          searchTerm
        )}&per_page=10&page=${page}&client_id=${NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
        {
          headers: {
            Authorization: `Client-ID ${NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (page === 1) {
        setResult(data);
        setAllResults(data.results || []);
      } else {
        setAllResults((prev) => [...prev, ...(data.results || [])]);
      }
      setCurrentPage(page);
    } catch (error) {
      console.error("이미지 검색 오류:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    handleAPI(currentPage + 1);
  };

  const handleImageContextMenu = (e, imageUrl, imageId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      imageUrl,
      imageId
    });
  };

  const handleDownloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `unsplash-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("이미지 다운로드 실패:", error);
    }
  };

  const handleCopyImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
    } catch (error) {
      console.error("이미지 복사 실패:", error);
    }
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, imageUrl: "", imageId: "" });
  };

  return (
    <WidgetCard
      icon={MdImageSearch}
      title="이미지 검색"
      dragHandleProps={dragHandleProps}
    >
      <div
        className="w-100 flex flex-col gap-10 max-h-px-300 overflow-y-auto"
        onClick={closeContextMenu}
      >
        <div className="flex jus-bet">
          <Input
            {...inputProps}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={"검색할 단어를 입력하세요"}
            onEnter={() => handleAPI(1)}
          />
        </div>
        {
          <div className="flex jus-cen item-cen w-100">
            {loading ? (
              <DotSpinner text="검색 중입니다..." />
            ) : result?.error ? (
              <Typography color={"red-6"}>오류: {result.error}</Typography>
            ) : !result ? (
              <Typography color={"cool-gray-7"}>
                검색결과가 없습니다.
              </Typography>
            ) : allResults.length === 0 ? (
              <Typography color={"cool-gray-7"}>
                검색결과가 없습니다.
              </Typography>
            ) : (
              <div className="w-100 flex flex-col gap-5">
                <Typography
                  as="div"
                  className="flex jus-end"
                  color={"cool-gray-7"}
                  size="sm"
                >
                  총 {result.total}건
                </Typography>
                {allResults.map((imageResult) => (
                  <div key={imageResult.id}>
                    <Image
                      src={imageResult.urls.small}
                      alt={imageResult.alt_description}
                      width={"100%"}
                      onContextMenu={(e) =>
                        handleImageContextMenu(
                          e,
                          imageResult.urls.regular,
                          imageResult.id
                        )
                      }
                    />
                  </div>
                ))}

                {/* 더 보기 버튼 */}
                {allResults.length < result.total && (
                  <div className="flex pd-20 flex-col">
                    <Button onClick={loadMore} disabled={loading}>
                      더보기
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        }
      </div>

      {/* 컨텍스트 메뉴 */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 bg-white border border-gray-300 rounded shadow-lg"
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              handleDownloadImage(contextMenu.imageUrl);
              closeContextMenu();
            }}
          >
            다운로드
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              handleCopyImage(contextMenu.imageUrl);
              closeContextMenu();
            }}
          >
            복사
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
