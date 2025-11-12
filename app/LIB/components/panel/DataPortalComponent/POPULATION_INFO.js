import { inputProps } from "@/app/LIB/constant/uiProps";
import { useEffect, useState } from "react";
import { Card, Divider, DotSpinner, Input, Select, Typography } from "sud-ui";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// 값 표시를 위한 플러그인
const valueLabelPlugin = {
  id: "valueLabel",
  afterDatasetsDraw: (chart) => {
    if (chart.config?.options?.indexAxis === "y") {
      return;
    }
    if (chart.config?.type === "line") {
      return;
    }
    const ctx = chart.ctx;
    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        const x = bar.x;
        const y = bar.y;
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.font = "600 14px sans-serif";
        ctx.fillStyle = "#4B5563";
        const formattedValue = Math.abs(value)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        ctx.fillText(formattedValue, x, y - 5);
        ctx.restore();
      });
    });
  }
};

ChartJS.register(valueLabelPlugin);

export default function POPULATION_INFO() {
  const [mainData, setMainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAdmmCd, setSelectedAdmmCd] = useState(null);
  const [admmCdOptions, setAdmmCdOptions] = useState([]);
  const [srchFrYm, setSrchFrYm] = useState(null);

  // dong_dict.json 로드
  useEffect(() => {
    const loadDongDict = async () => {
      try {
        const response = await fetch("/dong/dong_dict.json");
        const dong_dict = await response.json();
        // key가 value, value가 label
        const options = Object.keys(dong_dict).map((key) => ({
          label: dong_dict[key],
          value: key
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

  // 차트 데이터 구성
  const chartData = mainData
    ? {
        labels: ["남자", "여자"],
        datasets: [
          {
            label: "인구 수",
            data: [
              parseInt(mainData.maleNmprCnt) || 0,
              parseInt(mainData.femlNmprCnt) || 0
            ],
            backgroundColor: ["#36A2EB", "#FF6384"], // 남자 파란색, 여자 빨간색
            borderColor: ["#36A2EB", "#FF6384"],
            borderWidth: 1
          }
        ]
      }
    : null;

  // Y축 최대값 계산 (최대 인구 수의 1.2배로 여유 공간 확보)
  const maxValue = mainData
    ? Math.max(
        parseInt(mainData.maleNmprCnt) || 0,
        parseInt(mainData.femlNmprCnt) || 0
      ) * 1.2
    : 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${formatNumber(context.parsed.y)}명`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 14,
            weight: 400
          }
        },
        grid: {
          display: false
        },
        border: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        max: maxValue,
        ticks: {
          display: false
        },
        grid: {
          display: false
        },
        border: {
          display: false
        }
      }
    }
  };

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
    "100세 이상"
  ];

  const maleAgeCounts = Array.isArray(mainData?.maleAgeArray)
    ? mainData.maleAgeArray.map((value) => parseInt(value, 10) || 0)
    : null;

  const femaleAgeCounts = Array.isArray(mainData?.femlAgeArray)
    ? mainData.femlAgeArray.map((value) => parseInt(value, 10) || 0)
    : null;

  const maleAgePoints =
    maleAgeCounts && maleAgeCounts.length === ageLabels.length
      ? ageLabels.map((label, index) => ({
          x: maleAgeCounts[index] || 0,
          y: label
        }))
      : null;

  const femaleAgePoints =
    femaleAgeCounts && femaleAgeCounts.length === ageLabels.length
      ? ageLabels.map((label, index) => ({
          x: femaleAgeCounts[index] || 0,
          y: label
        }))
      : null;

  const populationLineData =
    maleAgePoints && femaleAgePoints
      ? {
          datasets: [
            {
              label: "남자",
              data: maleAgePoints,
              borderColor: "#36A2EB",
              backgroundColor: "rgba(54, 162, 235, 0.15)",
              pointBackgroundColor: "#36A2EB",
              pointBorderColor: "#36A2EB",
              pointRadius: 4,
              tension: 0.3,
              fill: false,
              parsing: {
                xAxisKey: "x",
                yAxisKey: "y"
              }
            },
            {
              label: "여자",
              data: femaleAgePoints,
              borderColor: "#FF6384",
              backgroundColor: "rgba(255, 99, 132, 0.15)",
              pointBackgroundColor: "#FF6384",
              pointBorderColor: "#FF6384",
              pointRadius: 4,
              tension: 0.3,
              fill: false,
              parsing: {
                xAxisKey: "x",
                yAxisKey: "y"
              }
            }
          ]
        }
      : null;

  const lineMaxValue =
    maleAgePoints && femaleAgePoints
      ? Math.max(
          ...maleAgePoints.map((point) => point.x || 0),
          ...femaleAgePoints.map((point) => point.x || 0)
        )
      : 0;

  const lineAxisMax =
    lineMaxValue > 0 ? Math.ceil(lineMaxValue / 500) * 500 : 500;

  const populationLineOptions = populationLineData
    ? {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              boxWidth: 6,
              padding: 16
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const { x, y } = context.parsed;
                return `${context.dataset.label}, ${y} : ${formatNumber(x)}명`;
              }
            }
          }
        },
        scales: {
          x: {
            type: "linear",
            grid: {
              display: false
            },
            ticks: {
              callback: (value) => formatNumber(value),
              font: {
                size: 12
              }
            },
            min: 0,
            suggestedMax: lineAxisMax
          },
          y: {
            type: "category",
            labels: ageLabels,
            reverse: true,
            beginAtZero: true,
            ticks: {
              font: {
                size: 12
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    : null;

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
                <div style={{ height: "150px", width: "100%" }}>
                  {chartData && <Bar data={chartData} options={chartOptions} />}
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
                {/* 연령대별 추이 선형 차트 */}
                <div style={{ height: "320px", width: "100%" }}>
                  {populationLineData && populationLineOptions ? (
                    <Line
                      data={populationLineData}
                      options={populationLineOptions}
                    />
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
