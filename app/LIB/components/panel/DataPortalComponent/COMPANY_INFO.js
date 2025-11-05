import { inputProps } from "@/app/LIB/constant/uiProps";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Collapse,
  Divider,
  DotSpinner,
  Input,
  Pagination,
  Typography
} from "sud-ui";

export default function COMPANY_INFO() {
  const [mainData, setMainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const handleSearch = async (isNewSearch = false) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setMainData(null);
    setTotalCount(0);
    try {
      const res = await fetch(
        `/api/dataportal?select_value=COMPANY_INFO&pageNo=${
          isNewSearch ? 1 : page
        }&q=${searchTerm}`
      );
      if (!res.ok) {
        throw new Error(`API 오류: ${res.status}`);
      }
      const data = await res.json();
      setMainData(data.body);
      setTotalCount(data.body.totalCount);
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
    if (searchTerm.trim() && page !== currentPage) {
      handleSearch(false);
    }
  }, [page]);

  console.log(mainData);

  return (
    <div className="w-100 flex flex-col gap-5">
      <div className="flex jus-bet">
        <Input
          {...inputProps}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={"검색할 기업명을 입력하세요"}
          onEnter={() => handleSearch(true)}
        />
      </div>
      {loading ? (
        <DotSpinner text="검색 중입니다..." />
      ) : mainData && mainData.items.length > 0 ? (
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
            {/* {mainData.items.map((i, idx) => {
              const item = i.item;
              const formatDate = (date) => {
                // date format: 20251105
                // return format: 2025년 11월 05일
                return `${date.slice(0, 4)}년 ${date.slice(
                  4,
                  6
                )}월 ${date.slice(6, 8)}일`;
              };
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
                  )
                }
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
            })} */}
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
                size: "sm"
              }}
              defaultStyle={{
                background: "mint-1",
                color: "mint-7",
                size: "sm"
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
