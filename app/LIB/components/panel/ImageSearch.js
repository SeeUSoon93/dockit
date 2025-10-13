import {
  Avatar,
  Button,
  Card,
  Div,
  Divider,
  DotSpinner,
  Image,
  Input,
  Modal,
  Pagination,
  Typography
} from "sud-ui";
import WidgetCard from "./WidgetCard";
import { inputProps } from "../../constant/uiProps";
import { useState, useEffect } from "react";
import { MdImageSearch } from "react-icons/md";
import { useLayout } from "../../context/LayoutContext";
import { CalendarOutline, Download, HeartFill, Link } from "sud-icons";

export default function ImageSearch({ dragHandleProps }) {
  const { layoutMode } = useLayout();
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const searchImages = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(
        `/api/search-image?q=${encodeURIComponent(searchTerm)}&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResult(data);
      setCurrentPage(page);
    } catch (error) {
      console.error("이미지 검색 오류:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
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

  // 페이지가 바뀔 때마다 검색 실행
  useEffect(() => {
    if (searchTerm.trim() && page !== currentPage) {
      searchImages();
    }
  }, [page]);

  return (
    <WidgetCard
      icon={MdImageSearch}
      title="이미지 검색"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10 max-h-px-300 overflow-y-auto">
        <div className="flex jus-bet">
          <Input
            {...inputProps}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={"검색할 단어를 입력하세요"}
            onEnter={() => searchImages()}
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
                {result.results.map((imageResult) => (
                  <div key={imageResult.id}>
                    <Image
                      src={imageResult.urls.regular}
                      alt={imageResult.alt_description}
                      width={"100%"}
                      preview={false}
                      onClick={() => {
                        setSelectedImage(imageResult);
                        setOpenModal(true);
                      }}
                    />
                  </div>
                ))}

                {result && result.total > 10 && (
                  <div>
                    <Pagination
                      align="center"
                      total={result?.total}
                      defaultCurrent={page}
                      onChange={setPage}
                      maxVisibleButtons={3}
                      activeStyle={{
                        background: "mint-7",
                        color: "mint-1",
                        size: "sm"
                      }}
                      defaultStyle={{
                        background: "mint-1",
                        color: "mint-7",
                        size: "sm"
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        }
      </div>

      {selectedImage && (
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          width={layoutMode === "desktop" ? "50vw" : "90vw"}
          className="overflow-y-auto"
          thumb={selectedImage.urls.full}
          border={false}
          style={{ maxHeight: "80vh" }}
        >
          <div className="flex flex-col gap-15">
            <div className="flex justify-between items-end">
              {/* 유저 프로필 */}
              <div className="flex items-center gap-5">
                <Avatar
                  src={
                    selectedImage.user.profile_image.medium ||
                    selectedImage.user.name
                  }
                  alt={selectedImage.user.name}
                  size="xs"
                  border={true}
                />
                <div className="flex flex-col gap-3">
                  <Typography pretendard="SB">
                    {selectedImage.user.name}
                  </Typography>
                  <Typography
                    as="a"
                    target="_blank"
                    href={selectedImage.user.links.html}
                    className="flex items-center gap-3"
                    size="sm"
                  >
                    <Link size={12} /> {selectedImage.user.links.html}
                  </Typography>
                </div>
              </div>
              {/* 좋아요 & 업데이트 날짜 */}
              <div className="flex flex-col gap-10">
                <div className="flex justify-end">
                  <Download
                    size={18}
                    onClick={() => handleDownloadImage(selectedImage.urls.full)}
                    className="cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Div color="volcano">
                    <HeartFill size={18} />
                  </Div>
                  <Typography size="sm">{selectedImage.likes}</Typography>
                  <Divider vertical style={{ height: "13px", margin: 5 }} />
                  <Div color="mint-7">
                    <CalendarOutline size={18} />
                  </Div>
                  <Typography size="sm">
                    {new Date(selectedImage.created_at).toLocaleDateString(
                      "ko-KR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }
                    )}
                  </Typography>
                </div>
              </div>
            </div>
            {/* 사진 설명 */}
            <Card width={"100%"} shadow="none">
              <Typography>
                {selectedImage.description || selectedImage.alt_description}
              </Typography>
            </Card>
          </div>
        </Modal>
      )}
    </WidgetCard>
  );
}
