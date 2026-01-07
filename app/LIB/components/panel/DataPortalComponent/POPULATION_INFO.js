import { inputProps } from "@/app/LIB/constant/uiProps";
import { useEffect, useState } from "react";
import { Card, Divider, DotSpinner, Input, Select, Typography } from "sud-ui";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
  Legend,
  Cell,
} from "recharts";

export default function POPULATION_INFO() {
  const [mainData, setMainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAdmmCd, setSelectedAdmmCd] = useState(null);
  const [admmCdOptions, setAdmmCdOptions] = useState([]);
  const [srchFrYm, setSrchFrYm] = useState("");

  // dong_dict.json 로드
  useEffect(() => {
    const loadDongDict = async () => {
      try {
        const response = await fetch("/dong/dong_dict.json");
        const dong_dict = await response.json();
        // key가 value, value가 label
        const options = Object.keys(dong_dict).map((key) => ({
          label: dong_dict[key],
          value: key,
        }));
        setAdmmCdOptions(options);
      } catch (error) {
        console.error("dong_dict.json 로드 실패:", error);
      }
    };
    loadDongDict();
  }, []);

  useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthAgoString = oneMonthAgo
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "")
      .slice(0, 6);
    setSrchFrYm(oneMonthAgoString);
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setMainData(null);
    setError(null);
    try {
      const response = await fetch(
        `/api/population-info?q=${selectedAdmmCd}&srchFrYm=${srchFrYm}`
      );
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }
      const data = await response.json();

      setMainData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAdmmCd) {
      handleSearch();
    }
  }, [selectedAdmmCd]);

  // 숫자 3자리마다 쉼표 표시
  const formatNumber = (number) => {
    if (!number) return "-";
    if (number === 0) return "0";
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 막대 차트 데이터 구성 (Recharts 형식)
  const barChartData = mainData
    ? [
        {
          name: "남자",
          value: parseInt(mainData.maleNmprCnt) || 0,
        },
        {
          name: "여자",
          value: parseInt(mainData.femlNmprCnt) || 0,
        },
      ]
    : [];

  // Y축 최대값 계산 (최대 인구 수의 1.2배로 여유 공간 확보)
  const maxValue = mainData
    ? Math.max(
        parseInt(mainData.maleNmprCnt) || 0,
        parseInt(mainData.femlNmprCnt) || 0
      ) * 1.2
    : 0;

  const ageLabels = [
    "0-9세",
    "10대",
    "20대",
    "30대",
    "40대",
    "50대",
    "60대",
    "70대",
    "80대",
    "90대",
    "100세 이상",
  ];

  const maleAgeCounts = Array.isArray(mainData?.maleAgeArray)
    ? mainData.maleAgeArray.map((value) => parseInt(value, 10) || 0)
    : null;

  const femaleAgeCounts = Array.isArray(mainData?.femlAgeArray)
    ? mainData.femlAgeArray.map((value) => parseInt(value, 10) || 0)
    : null;

  // Area 차트 데이터 구성 (Recharts 형식)
  const areaChartData =
    maleAgeCounts &&
    femaleAgeCounts &&
    maleAgeCounts.length === ageLabels.length &&
    femaleAgeCounts.length === ageLabels.length
      ? ageLabels.map((label, index) => ({
          name: label,
          남자: maleAgeCounts[index] * -1 || 0,
          여자: femaleAgeCounts[index] || 0,
        }))
      : [];

  // X축 최대값 계산 (남자는 음수이므로 절댓값 사용)
  const areaMaxValue =
    areaChartData.length > 0
      ? Math.max(
          ...areaChartData.map((item) =>
            Math.max(Math.abs(item.남자), Math.abs(item.여자))
          )
        )
      : 0;

  const areaAxisMax =
    areaMaxValue > 0 ? Math.ceil(areaMaxValue / 500) * 500 : 500;

  // (srchFrYm이 이 함수 스코프에서 접근 가능하다고 가정)

  const inputError = () => {
    const minDate = 202210;
    const today = new Date();
    const todayString = today
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "")
      .slice(0, 6); // "202511"
    const maxDateLimit = parseInt(todayString, 10);
    if (srchFrYm < minDate || srchFrYm >= maxDateLimit) {
      return true; // 에러 발생
    }

    // 6글자가 아니면 에러
    if (srchFrYm.length !== 6) {
      return true;
    }

    // 숫자가 아니면 에러
    if (isNaN(srchFrYm)) {
      return true;
    }

    return false;
  };

  return (
    <div className="w-100 flex flex-col gap-5">
      <div className="grid gap-5" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <Select
          {...inputProps}
          value={selectedAdmmCd}
          onChange={(value) => setSelectedAdmmCd(value)}
          placeholder={"검색할 행정동을 선택하세요"}
          options={admmCdOptions}
          searchable
        />
        <Input
          {...inputProps}
          value={srchFrYm}
          onChange={(e) => setSrchFrYm(e.target.value)}
          placeholder={"검색할 기준 월을 입력하세요"}
          onEnter={() => {
            if (!inputError()) {
              handleSearch();
            }
          }}
          error={inputError()}
        />
      </div>

      {inputError() && (
        <div className="flex jus-end item-cen">
          <Typography color="red-6" size="xs">
            ※ 2022년 10월부터 현재 기준 이전 월까지만 가능합니다.
          </Typography>
        </div>
      )}
      {loading ? (
        <DotSpinner text="검색 중입니다..." />
      ) : mainData ? (
        <>
          <div className="flex flex-col gap-10">
            <Card
              width="100%"
              className="flex flex-col gap-10"
              shadow="none"
              background={"cool-gray-1"}
            >
              <div className="flex flex-col">
                <div className="flex flex-col item-cen">
                  <Typography pretendard="SB" size="lg">
                    {mainData.ctpvNm} {mainData.sggNm} {mainData.dongNm}
                  </Typography>
                  <Typography size="xs">
                    (기준날짜 : {mainData.statsYm.slice(0, 4)}년{" "}
                    {mainData.statsYm.slice(4, 6)}월)
                  </Typography>
                </div>
                <Divider content="인구 정보" />
                <Typography>
                  ■ 총 인구 수 : {formatNumber(mainData.totNmprCnt)}명
                </Typography>
                <div className="grid grid-cols-2 gap-5">
                  <Typography>
                    ■ 세대 수 : {formatNumber(mainData.hhCnt)}개
                  </Typography>
                  {/* 총인구수 / 세대수 */}
                  <Typography>
                    ■ 세대 당 인구 :{" "}
                    {(mainData.totNmprCnt / mainData.hhCnt).toFixed(1)}명
                  </Typography>
                </div>

                {/* 성별 인구 분포 */}
                <Divider content="성별 인구 분포" />
                <div style={{ height: "200px", width: "100%" }}>
                  {barChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barChartData}
                        margin={{ top: 20, right: 10, bottom: 5, left: 0 }}
                      >
                        <XAxis dataKey="name" fontSize={14} tickLine={false} />
                        <YAxis domain={[0, maxValue]} hide />
                        <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                          {barChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === 0 ? "#36A2EB" : "#FF6384"}
                            />
                          ))}
                          <LabelList
                            dataKey="value"
                            position="top"
                            formatter={(value) => formatNumber(value)}
                            fontSize={14}
                            fontWeight={600}
                            fill="#4B5563"
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
                <div className="flex jus-end">
                  <Typography size="sm" color="cool-gray-7">
                    ※ 성비 (여자 100명당 남자 수) :{" "}
                    {mainData.maleNmprCnt && mainData.femlNmprCnt
                      ? (
                          (parseInt(mainData.maleNmprCnt) /
                            parseInt(mainData.femlNmprCnt)) *
                          100
                        ).toFixed(1)
                      : "-"}{" "}
                    명
                  </Typography>
                </div>

                {/* 연령별 인구 분포 */}
                <Divider content="연령별 인구 분포" />
                {/* 연령대별 추이 Area 차트 */}
                <div style={{ height: "350px", width: "100%" }}>
                  {areaChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={areaChartData}
                        margin={{ top: 15, right: 20, left: 0 }}
                        layout="vertical"
                      >
                        <XAxis
                          type="number"
                          domain={[-areaAxisMax, areaAxisMax]}
                          tickFormatter={(value) =>
                            formatNumber(Math.abs(value))
                          }
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          fontSize={12}
                          reversed
                          tickLine={false}
                        />
                        <Legend
                          verticalAlign="bottom"
                          iconType="line"
                          wrapperStyle={{ paddingTop: "10px" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="남자"
                          stackId="1"
                          stroke="#36A2EB"
                          fill="#36A2EB"
                          fillOpacity={0.2}
                          strokeWidth={2}
                          dot={{ r: 1 }}
                        >
                          <LabelList
                            dataKey="남자"
                            position="left"
                            formatter={(value) => formatNumber(Math.abs(value))}
                            fontSize={12}
                            offset={5}
                          />
                        </Area>
                        <Area
                          type="monotone"
                          dataKey="여자"
                          stackId="2"
                          stroke="#FF6384"
                          fill="#FF6384"
                          fillOpacity={0.2}
                          strokeWidth={2}
                          dot={{ r: 1 }}
                        >
                          <LabelList
                            dataKey="여자"
                            position="right"
                            formatter={(value) => formatNumber(value)}
                            fontSize={12}
                            offset={5}
                          />
                        </Area>
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex jus-cen item-cen h-100">
                      <Typography color="cool-gray-7" size="sm">
                        연령별 인구 데이터를 찾을 수 없습니다.
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </Card>
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
