import { inputProps } from "@/app/LIB/constant/uiProps";
import { useLayout } from "@/app/LIB/context/LayoutContext";
import { useEffect, useState } from "react";
import {
  Card,
  DotSpinner,
  Input,
  Modal,
  Pagination,
  Tag,
  Typography,
} from "sud-ui";
import { Download } from "sud-icons";

export default function TOUR_PHOTO() {
  const { layoutMode } = useLayout();
  const [mainData, setMainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleSearch = async (isNewSearch = false) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setMainData(null);
    setTotalCount(0);
    try {
      const res = await fetch(
        `/api/dataportal?select_value=TOUR_PHOTO&pageNo=${
          isNewSearch ? 1 : page
        }&q=${searchTerm}`
      );
      if (!res.ok) {
        throw new Error(`API 오류: ${res.status}`);
      }
      const data = await res.json();
      setMainData(data.response.body);
      setTotalCount(data.response.body.totalCount);
      setCurrentPage(isNewSearch ? 1 : page);
      if (isNewSearch) {
        setPage(1);
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleDownloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tour-photo-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("이미지 다운로드 실패:", error);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() && page !== currentPage) {
      handleSearch(false);
    }
  }, [page]);

  return (
    <div className="w-100 flex flex-col gap-5">
      <div className="flex jus-bet">
        <Input
          {...inputProps}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={"검색할 키워드를 입력하세요"}
          onEnter={() => handleSearch(true)}
        />
      </div>
      {loading ? (
        <DotSpinner text="검색 중입니다..." />
      ) : mainData && totalCount > 0 ? (
        <>
          <Typography
            as="div"
            className="flex jus-end"
            color={"cool-gray-7"}
            size="sm"
          >
            총 {totalCount}건
          </Typography>
          <div className="flex flex-col gap-10">
            {mainData.items.item.map((i, idx) => {
              const formatDate = (date) => {
                // date format: 20190109152342
                // return format: 2025년 11월 05일 00:00
                return `${date.slice(0, 4)}년 ${date.slice(
                  4,
                  6
                )}월 ${date.slice(6, 8)}일 ${date.slice(8, 10)}시 ${date.slice(
                  10,
                  12
                )}분 ${date.slice(12, 14)}초`;
              };

              // "서울빛초롱축제, 서울특별시 종로구, 2018 하반기 기획사진, 청계천 야경, 서울 등 축제, 서울 축제" 를 배열로 변환
              const keywordArray = i.galSearchKeyword.split(", ");

              return (
                <Card
                  width="100%"
                  key={i.galContentId}
                  className="flex flex-col gap-10 cursor-pointer"
                  shadow="none"
                  background={"cool-gray-1"}
                  thumb={i.galWebImageUrl}
                  onClick={() => {
                    setSelectedImage(i.galWebImageUrl);
                    setOpenModal(true);
                  }}
                  footer={
                    <div className="flex flex-col gap-5">
                      <Typography pretendard="SB">{i.galTitle}</Typography>
                      <div className="flex flex-wrap gap-5">
                        {keywordArray.map((keyword, idx) => (
                          <Tag key={idx}>
                            <Typography size="xs">{keyword}</Typography>
                          </Tag>
                        ))}
                      </div>
                      <div className="flex jus-end">
                        <Typography size="xs">
                          {formatDate(i.galCreatedtime)}
                        </Typography>
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>
          {mainData && totalCount > 10 && (
            <Pagination
              align="center"
              total={totalCount}
              defaultCurrent={page}
              onChange={setPage}
              maxVisibleButtons={3}
              activeStyle={{
                background: "mint-7",
                color: "mint-1",
                size: "sm",
              }}
              defaultStyle={{
                background: "mint-1",
                color: "mint-7",
                size: "sm",
              }}
            />
          )}
        </>
      ) : (
        !loading &&
        !error && (
          <div className="flex jus-cen item-cen w-100">
            <Typography color={"cool-gray-7"}>검색결과가 없습니다.</Typography>
          </div>
        )
      )}
      {selectedImage && (
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          width={layoutMode === "desktop" ? "50vw" : "90vw"}
          className="overflow-y-auto"
          thumb={selectedImage}
          border={false}
          style={{ maxHeight: "80vh" }}
          footer={
            <div className="flex flex-col gap-15">
              <div className="flex justify-end">
                <Download
                  size={18}
                  onClick={() => handleDownloadImage(selectedImage)}
                  className="cursor-pointer"
                />
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
