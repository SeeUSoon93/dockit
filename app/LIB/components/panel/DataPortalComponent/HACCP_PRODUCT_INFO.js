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
  Tag,
  Typography,
} from "sud-ui";

export default function HACCP_PRODUCT_INFO() {
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
        `/api/dataportal?select_value=HACCP_PRODUCT_INFO&pageNo=${
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

  return (
    <div className="w-100 flex flex-col gap-5">
      <div className="flex jus-bet">
        <Input
          {...inputProps}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={"검색할 제품을 입력하세요"}
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
            {mainData.items.map((i, idx) => {
              const item = i.item;
              const collapseItems = [
                {
                  key: "detail",
                  label: "상세정보",
                  children: (
                    <div className="flex flex-col">
                      <Divider content="영양성분" />
                      <Typography size="sm" style={{ whiteSpace: "pre-line" }}>
                        {item.nutrient}
                      </Typography>
                      <Divider content="원재료" />
                      <Typography size="sm" style={{ whiteSpace: "pre-line" }}>
                        {item.rawmtrl}
                      </Typography>
                      <Divider content="알레르기 유발물질" />
                      <Typography size="sm" style={{ whiteSpace: "pre-line" }}>
                        {item.allergy}
                      </Typography>
                    </div>
                  ),
                },
              ];
              return (
                <Card
                  width="100%"
                  key={item.prdlstReportNo}
                  className="flex flex-col gap-10"
                  shadow="none"
                  background={"cool-gray-1"}
                  thumb={item.imgurl1}
                >
                  <div className="flex flex-col">
                    <Typography pretendard="SB">{item.prdlstNm}</Typography>
                    <Tag>
                      <Typography size="xs">{item.prdkind}</Typography>
                    </Tag>
                    <Typography size="sm">
                      제조원 : {item.manufacture}
                    </Typography>
                    <Typography size="sm">판매원 : {item.seller}</Typography>
                  </div>
                  <Collapse items={collapseItems} size="sm" shadow="none" />
                </Card>
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
    </div>
  );
}
