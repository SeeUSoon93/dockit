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
  PiLinkBold,
  PiMapPinLineBold,
  PiPhoneBold,
} from "react-icons/pi";
export default function CULTURE_INFO() {
  const [mainData, setMainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDtype, setSelectedDtype] = useState("연극");
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const handleSearch = async (isNewSearch = false) => {
    if (!selectedDtype.trim() || !title.trim()) return;
    setLoading(true);
    setMainData(null);
    setTotalCount(0);
    try {
      const res = await fetch(
        `/api/dataportal?select_value=CULTURE_INFO&pageNo=${
          isNewSearch ? 1 : page
        }&sub_value=${selectedDtype}&q=${title}`
      );
      if (!res.ok) {
        throw new Error(`API 오류: ${res.status}`);
      }
      const data = await res.json();
      setMainData(data.response.body.items.item);
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
  useEffect(() => {
    if (selectedDtype.trim() && title.trim() && page !== currentPage) {
      handleSearch(false);
    }
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

  return (
    <div className="w-100 flex flex-col gap-5">
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 2fr" }}>
        <Select
          {...inputProps}
          value={selectedDtype}
          onChange={(value) => setSelectedDtype(value)}
          placeholder={"분류를 선택하세요"}
          options={[
            { label: "연극", value: "연극" },
            { label: "뮤지컬", value: "뮤지컬" },
            { label: "오페라", value: "오페라" },
            { label: "음악", value: "음악" },
            { label: "콘서트", value: "콘서트" },
            { label: "국악", value: "국악" },
            { label: "무용", value: "무용" },
            { label: "전시", value: "전시" },
            { label: "기타", value: "기타" },
          ]}
          searchable
        />
        <Input
          {...inputProps}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={"검색할 제목을 입력하세요"}
          onEnter={() => {
            handleSearch(true);
          }}
        />
      </div>
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
          <div className="flex flex-col gap-10">
            <Collapse
              items={mainData.map((item, idx) => ({
                key: idx,
                label: item.title,
                children: (
                  <Card
                    width="100%"
                    className="flex flex-col gap-10"
                    shadow="none"
                    background={"cool-gray-1"}
                    thumb={item.imageObject}
                  >
                    <div className="flex flex-col gap-10">
                      <Typography pretendard="SB">{item.title}</Typography>
                      <div>
                        {item.eventSite && (
                          <Typography
                            size="sm"
                            as="div"
                            className="flex item-cen gap-2"
                          >
                            <PiMapPinLineBold />
                            {item.eventSite}
                          </Typography>
                        )}
                        <Typography
                          size="sm"
                          as="div"
                          className="flex item-cen gap-2"
                        >
                          <PiCalendarMinusBold />
                          {/* eventPeriod가 없으면 period 출력
                          eventPeriod가 2자리 이상이면 period 출력
                          
                          eventPeriod가 있으면 eventPeriod 출력
                          eventPeriod가 2자리 이상이면 eventPeriod 출력
                          */}
                          {item.eventPeriod && item.eventPeriod.length >= 8
                            ? formatDate(item.eventPeriod)
                            : item.period && item.period.length >= 8
                            ? formatDate(item.period)
                            : "-"}
                        </Typography>
                        <Typography
                          size="sm"
                          as="div"
                          className="flex item-cen gap-2"
                        >
                          <PiPhoneBold />
                          {item.contactPoint}
                        </Typography>
                      </div>
                      {/* &nbsp;  &lt; &gt; 등 적용 되게  */}
                      <Typography
                        style={{
                          whiteSpace: "pre-line",
                          wordBreak: "break-all",
                        }}
                      >
                        {formatDescription(item.description)}
                      </Typography>
                      <div className="flex jus-end">
                        <Typography
                          size="sm"
                          as="div"
                          className="flex item-cen gap-2"
                          color="blue-7"
                        >
                          <PiArrowSquareOutBold />
                          <a href={item.url} target="_blank">
                            바로가기
                          </a>
                        </Typography>
                      </div>
                    </div>
                  </Card>
                ),
              }))}
            />
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
    </div>
  );
}
