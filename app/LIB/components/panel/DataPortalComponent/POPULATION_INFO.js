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
  Select,
  Typography,
} from "sud-ui";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// 값 표시를 위한 플러그인
const valueLabelPlugin = {
  id: "valueLabel",
  afterDatasetsDraw: (chart) => {
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
        const formattedValue = value
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        ctx.fillText(formattedValue, x, y - 5);
        ctx.restore();
      });
    });
  },
};

ChartJS.register(valueLabelPlugin);

export default function POPULATION_INFO() {
  const [mainData, setMainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAdmmCd, setSelectedAdmmCd] = useState(null);
  const [admmCdOptions, setAdmmCdOptions] = useState([]);

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

  const handleSearch = async () => {
    setLoading(true);
    setMainData(null);
    setError(null);
    try {
      const response = await fetch(`/api/population-info?q=${selectedAdmmCd}`);
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
              parseInt(mainData.femlNmprCnt) || 0,
            ],
            backgroundColor: ["#36A2EB", "#FF6384"], // 남자 파란색, 여자 빨간색
            borderColor: ["#36A2EB", "#FF6384"],
            borderWidth: 1,
          },
        ],
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
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${formatNumber(context.parsed.y)}명`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 14,
            weight: 400,
          },
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: maxValue,
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  };
  console.log(mainData);
  return (
    <div className="w-100 flex flex-col gap-5">
      <div className="flex jus-bet gap-5">
        <Select
          {...inputProps}
          value={selectedAdmmCd}
          onChange={(value) => setSelectedAdmmCd(value)}
          placeholder={"검색할 행정동을 선택하세요"}
          options={admmCdOptions}
          searchable
        />
      </div>
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
