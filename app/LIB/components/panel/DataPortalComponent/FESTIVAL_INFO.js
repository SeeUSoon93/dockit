import { inputProps } from "@/app/LIB/constant/uiProps";
import { useEffect, useState } from "react";
import {
  Card,
  Collapse,
  DotSpinner,
  Input,
  Pagination,
  Select,
  Typography,
} from "sud-ui";
import {
  PiArrowSquareOutBold,
  PiCalendarMinusBold,
  PiMapPinLineBold,
  PiPhoneBold,
} from "react-icons/pi";
export default function FESTIVAL_INFO() {
  const [mainData, setMainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const handleSearch = async (targetPage = 1) => {
    setLoading(true);
    setMainData(null);
    setTotalCount(0);
    try {
      const res = await fetch(
        `/api/dataportal?select_value=FESTIVAL_INFO&pageNo=${targetPage}`
      );
      if (!res.ok) {
        throw new Error(`API 오류: ${res.status}`);
      }
      const data = await res.json();
      const items = data.response?.body?.items?.item ?? [];
      setMainData(Array.isArray(items) ? items : [items]);
      setTotalCount(data.response?.body?.totalCount ?? 0);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleSearch(page);
  }, [page]);

  // 날짜 포맷
  // 20251025 ~ 20251025 > 2025.10.25 ~ 2025.10.25
  const formatDate = (date) => {
    return `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(
      6,
      8
    )} ~ ${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`;
  };
  const decodeHtmlEntities = (text) => {
    if (typeof window === "undefined") {
      return text;
    }
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  // 내용 포맷
  // html 태그 제거 + HTML 엔티티 디코드
  const formatDescription = (description = "") => {
    if (!description) return "";

    const withLineBreaks = description.replace(/<br\s*\/?>/gi, "\n");
    const stripped = withLineBreaks.replace(/<[^>]*>?/g, "");
    return decodeHtmlEntities(stripped);
  };

  console.log(mainData);
  return (
    <div className="w-100 flex flex-col gap-5">
      {loading ? (
        <DotSpinner text="검색 중입니다..." />
      ) : mainData && mainData.length > 0 ? (
        <>
          <Typography
            as="div"
            className="flex jus-end"
            color={"cool-gray-7"}
            size="sm"
          >
            총 {totalCount}건
          </Typography>
          <div className="flex flex-col gap-10"></div>
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
    </div>
  );
}
