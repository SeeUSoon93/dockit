import WidgetCard from "./WidgetCard";
import { useEditorContext } from "../../context/EditorContext";
import { Button, Card, Segmented, Typography } from "sud-ui";
import Chart from "./Chart";

import React from "react";
import {
  TbChartBar,
  TbChartDotsFilled,
  TbChartLine,
  TbChartPie
} from "react-icons/tb";

export default function MadeChart({ dragHandleProps }) {
  const { selectedObject, editor } = useEditorContext();
  const [tableData, setTableData] = React.useState(null);
  const [chartType, setChartType] = React.useState("bar");
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    if (selectedObject && selectedObject.node.type.name === "table") {
      const tableNode = selectedObject.node;
      const tableData = [];
      for (let rowIndex = 0; rowIndex < tableNode.childCount; rowIndex++) {
        const rowNode = tableNode.child(rowIndex);
        const rowData = [];

        for (let cellIndex = 0; cellIndex < rowNode.childCount; cellIndex++) {
          const cellNode = rowNode.child(cellIndex);
          const cellText = cellNode.textContent || "";
          rowData.push(cellText);
        }
        tableData.push(rowData);
      }
      setTableData(tableData);
    } else {
      setTableData(null);
    }
  }, [selectedObject]);

  const chartOptions = [
    { value: "bar", label: <TbChartBar /> },
    { value: "line", label: <TbChartLine /> },
    { value: "pie", label: <TbChartPie /> }
  ];

  // 차트 데이터 가공 함수 (Chart.js와 동일한 로직)
  const getChartData = () => {
    if (!tableData || tableData.length < 2) return null;

    const headers = tableData[0]; // 첫 번째 행은 헤더
    const dataRows = tableData.slice(1); // 나머지는 데이터

    const labels = dataRows.map((row) => row[0]); // 첫 번째 컬럼은 라벨

    if (chartType === "pie") {
      // 파이 차트는 첫 번째 데이터셋만 사용
      return {
        labels: labels,
        datasets: [
          {
            data: dataRows.map((row) => {
              const value = parseFloat(row[1]);
              return isNaN(value) ? 0 : value;
            }),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40"
            ]
          }
        ]
      };
    }

    return {
      labels: labels,
      datasets: headers.slice(1).map((header, index) => ({
        label: header,
        data: dataRows.map((row) => {
          const value = parseFloat(row[index + 1]);
          return isNaN(value) ? 0 : value;
        }),
        backgroundColor: `rgba(${54 + index * 50}, ${162 + index * 30}, ${
          235 - index * 40
        }, 0.5)`,
        borderColor: `rgba(${54 + index * 50}, ${162 + index * 30}, ${
          235 - index * 40
        }, 1)`,
        borderWidth: 2,
        tension: chartType === "line" ? 0.4 : 0,
        fill: false
      }))
    };
  };

  // 새로운 캔버스에 완전히 새로운 차트를 그려서 복사
  const copyChartAsImage = async () => {
    if (!tableData) return;

    try {
      // 차트 타입에 따른 적절한 비율 계산
      let targetWidth, targetHeight;
      const baseSize = 800; // 더 큰 기본 크기

      if (chartType === "pie") {
        // 파이 차트는 정사각형
        targetWidth = baseSize;
        targetHeight = baseSize;
      } else {
        // bar, line 차트는 데이터 개수에 따라 가로 길이 조정
        const dataCount = tableData.length - 1; // 헤더 제외
        const widthMultiplier = Math.min(Math.max(dataCount / 4, 1), 2.5);
        targetWidth = Math.floor(baseSize * widthMultiplier);
        targetHeight = Math.floor(baseSize * 0.7); // 적절한 비율
      }

      // 새로운 캔버스 생성
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      // 배경을 흰색으로 설정
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Chart.js 차트 데이터 가져오기
      const chartData = getChartData();
      if (!chartData) return;

      // Chart.js로 새로운 차트 생성
      const { Chart } = await import("chart.js/auto");

      const newChart = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
          responsive: false,
          maintainAspectRatio: false,
          animation: false, // 애니메이션 끄기
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: {
                  size: 24, // 범례 폰트 크기 대폭 증가
                  weight: "bold"
                },
                padding: 20
              }
            },
            tooltip: {
              titleFont: {
                size: 20
              },
              bodyFont: {
                size: 18
              }
            }
          },
          scales:
            chartType !== "pie"
              ? {
                  x: {
                    ticks: {
                      font: {
                        size: 20, // X축 라벨 폰트 크기 대폭 증가
                        weight: "bold"
                      }
                    },
                    title: {
                      font: {
                        size: 22,
                        weight: "bold"
                      }
                    }
                  },
                  y: {
                    ticks: {
                      font: {
                        size: 20, // Y축 라벨 폰트 크기 대폭 증가
                        weight: "bold"
                      }
                    },
                    title: {
                      font: {
                        size: 22,
                        weight: "bold"
                      }
                    }
                  }
                }
              : {}
        }
      });

      // 차트 렌더링 완료 대기
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 캔버스를 Blob으로 변환
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/png", 1.0);
      });

      // 클립보드에 복사
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob
        })
      ]);

      // 차트 인스턴스 정리
      newChart.destroy();

      console.log(
        `차트 이미지가 클립보드에 복사되었습니다 (${targetWidth}x${targetHeight})`
      );
    } catch (error) {
      console.error("차트 복사 중 오류:", error);
    }
  };

  return (
    <WidgetCard
      icon={TbChartDotsFilled}
      title="차트"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        <div className="flex justify-center">
          {selectedObject && selectedObject.node.type.name === "table" ? (
            <div className="flex flex-col gap-10 items-center w-100 ">
              <Segmented
                options={chartOptions}
                value={chartType}
                onChange={setChartType}
                block
              />
              <Card shadow="none" width="100%">
                <Chart
                  tableData={tableData}
                  chartType={chartType}
                  ref={chartRef}
                />
              </Card>
              <Button onClick={copyChartAsImage}>복사</Button>
            </div>
          ) : (
            <Typography color={"cool-gray-7"}>테이블을 선택하세요</Typography>
          )}
        </div>
      </div>
    </WidgetCard>
  );
}
