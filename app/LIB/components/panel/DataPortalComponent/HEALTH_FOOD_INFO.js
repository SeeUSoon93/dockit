import { inputProps } from "@/app/LIB/constant/uiProps";
import { useEffect, useState } from "react";
import { Card, Collapse, Divider, DotSpinner, Input, Typography } from "sud-ui";

const ITEMS_PER_PAGE = 10;

export default function HEALTH_FOOD_INFO() {
  const [mainData, setMainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const handleMainList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/dataportal?select_value=HEALTH_FOOD_INFO&pageNo=${page}`
      );
      if (!res.ok) {
        throw new Error(`API 오류: ${res.status}`);
      }
      const data = await res.json();
      setMainData(data.body);
      setTotalCount(data.body.totalCount);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleMainList();
  }, [page]);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + ITEMS_PER_PAGE);
  };
  const handleAPI = async (e) => {
    if (e.key === "Enter") {
      const q = searchTerm;
      console.log(q);
      if (!q) return; // 검색어가 없으면 요청하지 않음
      setLoading(true);
      setError(null);
      setVisibleCount(ITEMS_PER_PAGE);
    }
    try {
      const res = await fetch(
        `/api/dataportal?select_value=HEALTH_FOOD_INFO&pageNo=${page}&q=${q}`
      );
      if (!res.ok) {
        throw new Error(`API 오류: ${res.status}`);
      }
      const data = await res.json();
      setMainData(data.body);
      setTotalCount(data.body.totalCount);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const formatDate = (date) => {
    // date format: 20251105
    // return format: 2025년 11월 05일
    return `${date.slice(0, 4)}년 ${date.slice(4, 6)}월 ${date.slice(6, 8)}일`;
  };

  return (
    <div className="w-100 flex flex-col gap-5">
      <div className="flex jus-bet">
        <Input
          {...inputProps}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={"검색할 식품을 입력하세요"}
          onEnter={handleAPI}
        />
      </div>
      <Typography
        as="div"
        className="flex jus-end"
        color={"cool-gray-7"}
        size="sm"
      >
        총 {totalCount}건
      </Typography>
      {loading && <DotSpinner text="검색 중입니다..." />}
      {mainData && mainData.items.length > 0 ? (
        <div className="flex flex-col gap-10">
          {mainData.items.map((i, idx) => {
            const item = i.item;

            const collapseItems = [
              {
                key: "detail",
                label: "상세정보",
                children: (
                  <div className="flex flex-col">
                    <Divider content="성상" />
                    <Typography size="sm" style={{ whiteSpace: "pre-line" }}>
                      {item.SUNGSANG}
                    </Typography>
                    <Divider content="섭취방법" />
                    <Typography size="sm" style={{ whiteSpace: "pre-line" }}>
                      {item.SRV_USE}
                    </Typography>
                    <Divider content="기준규격" />
                    <Typography size="sm" style={{ whiteSpace: "pre-line" }}>
                      {item.BASE_STANDARD}
                    </Typography>
                    <Divider content="주된기능성" />
                    <Typography size="sm" style={{ whiteSpace: "pre-line" }}>
                      {item.MAIN_FNCTN}
                    </Typography>
                    <Divider content="섭취 시 주의사항" />
                    <Typography size="sm" style={{ whiteSpace: "pre-line" }}>
                      {item.INTAKE_HINT1}
                    </Typography>
                    <Divider content="소비 및 유통" />
                    <Typography size="sm" style={{ whiteSpace: "pre-line" }}>
                      {item.DISTB_PD}
                    </Typography>
                    <Typography size="sm" style={{ whiteSpace: "pre-line" }}>
                      {item.PRSRV_PD}
                    </Typography>
                  </div>
                ),
              },
            ];
            return (
              <Card
                width="100%"
                key={item.STTEMNT_NO}
                className="flex flex-col gap-10"
                shadow="none"
                background={"cool-gray-1"}
              >
                <div className="flex flex-col">
                  <Typography pretendard="SB">{item.PRDUCT}</Typography>
                  <Typography size="sm">{item.ENTRPS}</Typography>
                </div>
                <Collapse items={collapseItems} size="sm"></Collapse>
                <div className="flex jus-end">
                  <Typography size="xs">
                    등록일 : {formatDate(item.REGIST_DT)}
                  </Typography>
                </div>
              </Card>
            );
          })}
        </div>
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
