import { Button, DotSpinner, Input, Tag, Typography } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { FaBookBookmark } from "react-icons/fa6";
import { inputProps } from "../../constant/uiProps";
import { useState } from "react";

const ITEMS_PER_PAGE = 10;

export default function Dictionary({ dragHandleProps }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const handleAPI = async (e) => {
    if (e.key === "Enter") {
      const q = searchTerm;
      if (!q) return; // 검색어가 없으면 요청하지 않음
      setLoading(true);
      setError(null);
      setVisibleCount(ITEMS_PER_PAGE);

      try {
        const res = await fetch(`/api/dictionary?q=${q}`);

        if (!res.ok) {
          throw new Error(`API 오류: ${res.status}`);
        }

        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }
        setResult(data.channel);
        setLoading(false);
      } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
        setError(error.message);
        setLoading(false);
      }
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + ITEMS_PER_PAGE);
  };

  return (
    <WidgetCard
      icon={FaBookBookmark}
      title="사전"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10 max-h-px-300 overflow-y-auto">
        <div className="flex jus-bet">
          <Input
            {...inputProps}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={"검색할 단어를 입력하세요"}
            onEnter={handleAPI}
          />
        </div>
        {
          <div className="flex jus-cen item-cen w-100">
            {loading ? (
              <DotSpinner text="검색 중입니다..." />
            ) : error ? (
              <div className="flex flex-col gap-10 items-center">
                <Typography color="red" size="sm">
                  오류: {error}
                </Typography>
                <Button
                  size="sm"
                  onClick={() => setError(null)}
                  aria-label="에러 상태 초기화"
                >
                  다시 시도
                </Button>
              </div>
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
                <div className="flex flex-col gap-30">
                  {/* 검색결과 */}
                  {result.item?.slice(0, visibleCount).map((i, idx) => (
                    <div key={idx} className="flex flex-col gap-5">
                      <Typography pretendard="SB" size="lg">
                        {i.word}
                      </Typography>
                      {i.sense.map((s, idx) => (
                        <div key={idx} className="flex flex-col gap-5">
                          <div className="flex gap-5">
                            {s.pos && (
                              <Tag>
                                <Typography size="xs">{s.pos}</Typography>
                              </Tag>
                            )}
                            <Typography size="sm">{s.origin}</Typography>
                          </div>
                          <Typography>{s.definition}</Typography>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {result.item.length > visibleCount && (
                  <div className="flex flex-col pd-10">
                    <Button onClick={handleLoadMore} size="sm">
                      더보기
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        }
      </div>
    </WidgetCard>
  );
}
