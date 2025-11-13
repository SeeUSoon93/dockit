import { useEffect, useState } from "react";
import { PiArrowSquareOutBold, PiMapPinLineBold } from "react-icons/pi";
import {
  Button,
  Card,
  Collapse,
  Divider,
  DotSpinner,
  Pagination,
  Tag,
  Typography,
} from "sud-ui";
export default function SOCIAL_ENTERPRISE_INFO() {
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
        `/api/dataportal?select_value=SOCIAL_ENTERPRISE_INFO&pageNo=${targetPage}`
      );
      if (!res.ok) {
        throw new Error(`API 오류: ${res.status}`);
      }
      const data = await res.json();
      setMainData(data.data);
      setTotalCount(data.totalCount);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleSearch(page);
  }, [page]);

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
          <div className="flex flex-col gap-10">
            {mainData.map((item, idx) => {
              // 주소 포맷
              // 앞 6자리 삭제, (가 있으면 뒤로 삭제
              const formatAddress = (address) => {
                return address.slice(6).replace(/\(.*\)/, "");
              };

              const collapseItems = [
                {
                  key: "detail",
                  label: "상세정보",
                  children: (
                    <div className="flex flex-col">
                      <>
                        <Divider content="기본정보" />
                        {item.addr && item.addr.length > 6 && (
                          <Typography size="sm">
                            <b>주소 |</b> {formatAddress(item.addr)}
                          </Typography>
                        )}
                        {item.baseD && (
                          <Typography size="sm">
                            <b>개업일 |</b> {item.baseD}
                          </Typography>
                        )}
                        {item.ceoNmV && (
                          <Typography size="sm">
                            <b>대표자 |</b> {item.ceoNmV}
                          </Typography>
                        )}
                        {item.telNo && (
                          <Typography size="sm">
                            <b>전화번호 |</b> {item.telNo}
                          </Typography>
                        )}
                        {item.faxNo && (
                          <Typography size="sm">
                            <b>팩스번호 |</b> {item.faxNo}
                          </Typography>
                        )}
                      </>
                      <>
                        <Divider content="사회적 기업 정보" />

                        {item.certiEvalResult && (
                          <Typography size="sm">
                            <b>인증 여부 |</b>{" "}
                            {item.certiEvalResult ? "인증" : "미인증"}
                          </Typography>
                        )}
                        {item.certiIssuD && (
                          <Typography size="sm">
                            <b>인증일 |</b> {item.certiIssuD}
                          </Typography>
                        )}
                        {item.certiNumV && (
                          <Typography size="sm">
                            <b>인증번호 |</b> {item.certiNumV}
                          </Typography>
                        )}
                      </>
                      <div className="flex jus-end">
                        {item.homepageAddrV && (
                          <Button icon={<PiArrowSquareOutBold />} size="sm">
                            <a href={item.homepageAddrV} target="_blank">
                              <Typography size="xs">홈페이지</Typography>
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ),
                },
              ];
              return (
                <Card
                  key={idx}
                  width="100%"
                  className="flex flex-col gap-10"
                  shadow="none"
                  background={"cool-gray-1"}
                >
                  <div className="flex flex-col gap-5">
                    <Typography pretendard="SB">{item.entNmV}</Typography>
                    <div className="flex flex-wrap gap-5">
                      {item.busiAreaNm && (
                        <Tag>
                          <Typography size="xs">{item.busiAreaNm}</Typography>
                        </Tag>
                      )}
                      {item.busiContV &&
                        item.busiContV.split(" ").map(
                          (v, idx) =>
                            v && (
                              <Tag key={idx}>
                                <Typography size="xs">{v}</Typography>
                              </Tag>
                            )
                        )}
                    </div>
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
