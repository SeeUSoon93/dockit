import { inputProps } from "@/app/LIB/constant/uiProps";
import { useEffect, useState } from "react";
import { PhotoOutline } from "sud-icons";
import {
  Button,
  Card,
  Collapse,
  Div,
  Divider,
  DotSpinner,
  Input,
  Pagination,
  Typography,
} from "sud-ui";

export default function MOUNTAIN_INFO() {
  const [mainData, setMainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setMainData(null);
    try {
      const res = await fetch(
        `/api/dataportal?select_value=MOUNTAIN_INFO&q=${searchTerm}`
      );
      if (!res.ok) {
        throw new Error(`API 오류: ${res.status}`);
      }
      const data = await res.json();

      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];
      data.response.body.items.item = items;
      setMainData(items);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-100 flex flex-col gap-5">
      <div className="flex jus-bet">
        <Input
          {...inputProps}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={"검색할 산 이름을 입력하세요"}
          onEnter={() => handleSearch()}
        />
      </div>
      {loading ? (
        <DotSpinner text="검색 중입니다..." />
      ) : mainData ? (
        <>
          <div className="flex flex-col gap-10">
            {mainData.map((i, idx) => {
              // 이미지가 배열이 아니면 배열로 반환
              const imageArray = Array.isArray(i.image.response.body.items.item)
                ? i.image.response.body.items.item
                : [i.image.response.body.items.item];
              let thumbnailUrl = null;
              if (imageArray[0] && imageArray[0].imgfilename) {
                thumbnailUrl = `https://www.forest.go.kr/images/data/down/mountain/${imageArray[0].imgfilename}`;
              } else {
                thumbnailUrl = (
                  <Div
                    className="flex flex-col item-cen jus-cen gap-5 pd-20"
                    background="white-10"
                  >
                    <PhotoOutline size={50} />
                    <Typography size="sm">이미지가 없습니다.</Typography>
                  </Div>
                );
              }

              return (
                <Card
                  width="100%"
                  key={i.mntilistno}
                  className="flex flex-col gap-10"
                  shadow="none"
                  background={"cool-gray-1"}
                  thumb={thumbnailUrl}
                >
                  <Collapse
                    shadow="none"
                    items={[
                      {
                        key: "detail",
                        label: (
                          <Typography pretendard="SB">{i.mntiname}</Typography>
                        ),
                        children: (
                          <div className="flex flex-col">
                            <Typography size="sm">{i.mntidetails}</Typography>
                            <Divider content="상세정보" />
                            <Typography size="sm">
                              소재지 : {i.mntiadd}
                            </Typography>
                            <Typography size="sm">
                              높이 : {i.mntihigh}m
                            </Typography>
                            <Typography size="sm">
                              관리기관 : {i.mntiadmin}
                            </Typography>
                            <Typography size="sm">
                              관리기관전화 : {i.mntiadminnum}
                            </Typography>
                          </div>
                        ),
                      },
                    ]}
                  />
                </Card>
              );
            })}
          </div>
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
