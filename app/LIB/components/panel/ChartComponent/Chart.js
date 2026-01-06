import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Typography } from "sud-ui";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const Chart = React.forwardRef(
  ({ tableData, chartType, isAxesSwapped = false }, ref) => {
    // 차트 데이터 가공
    const getChartData = () => {
      if (!tableData || tableData.length < 2) return null;

      let processedData = tableData;

      // 축이 전환된 경우 테이블을 transpose
      if (isAxesSwapped) {
        const maxCols = Math.max(...tableData.map((row) => row.length));
        processedData = [];
        for (let colIndex = 0; colIndex < maxCols; colIndex++) {
          const newRow = [];
          for (let rowIndex = 0; rowIndex < tableData.length; rowIndex++) {
            newRow.push(tableData[rowIndex][colIndex] || "");
          }
          processedData.push(newRow);
        }
      }

      const headers = processedData[0]; // 첫 번째 행은 헤더
      const dataRows = processedData.slice(1); // 나머지는 데이터

      const labels = dataRows.map((row) => row[0]); // 첫 번째 컬럼은 라벨

      if (chartType === "pie") {
        // 파이 차트는 첫 번째 데이터셋만 사용
        const pieColors = [
          { bg: "rgba(255, 99, 132, 0.5)", border: "rgba(255, 99, 132, 1)" }, // #FF6384
          { bg: "rgba(54, 162, 235, 0.5)", border: "rgba(54, 162, 235, 1)" }, // #36A2EB
          { bg: "rgba(255, 206, 86, 0.5)", border: "rgba(255, 206, 86, 1)" }, // #FFCE56
          { bg: "rgba(75, 192, 192, 0.5)", border: "rgba(75, 192, 192, 1)" }, // #4BC0C0
          { bg: "rgba(153, 102, 255, 0.5)", border: "rgba(153, 102, 255, 1)" }, // #9966FF
          { bg: "rgba(255, 159, 64, 0.5)", border: "rgba(255, 159, 64, 1)" }, // #FF9F40
        ];

        return {
          labels: labels,
          datasets: [
            {
              data: dataRows.map((row) => {
                const value = parseFloat(row[1]);
                return isNaN(value) ? 0 : value;
              }),
              backgroundColor: pieColors.map((c) => c.bg),
              borderColor: pieColors.map((c) => c.border),
              borderWidth: 2,
            },
          ],
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
          tension: chartType === "line" ? 0.4 : 0, // 선 그래프일 때만 곡선 적용
          fill: false, // 선 그래프 아래쪽 채우지 않음
        })),
      };
    };

    const chartData = getChartData();

    const renderChart = () => {
      if (!chartData)
        return (
          <Typography color="cool-gray-7">차트 데이터가 없습니다</Typography>
        );

      // 차트 데이터에서 최대값 계산 (라인 차트 y축 설정용)
      const getMaxValue = () => {
        if (!chartData || !chartData.datasets) return null;
        let max = 0;
        chartData.datasets.forEach((dataset) => {
          dataset.data.forEach((value) => {
            if (typeof value === "number" && value > max) {
              max = value;
            }
          });
        });
        return max;
      };

      const maxValue = getMaxValue();
      const yAxisMax = maxValue ? Math.ceil(maxValue * 1.1) : undefined; // 최대값의 110%로 설정

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: chartType === "pie" ? 20 : 10, // 파이차트 라벨이 잘리지 않도록 여백 확보
        },
        plugins: {
          // 1. 범례 설정: 여기서 한 번에 관리하여 위치 고정
          legend: {
            display: true,
            position: "bottom",
          },
          tooltip: {
            enabled: false,
          },
        },
      };

      switch (chartType) {
        case "bar":
          return (
            <Bar ref={ref} data={chartData} options={options} height={200} />
          );
        case "line":
          return (
            <Line ref={ref} data={chartData} options={options} height={200} />
          );
        case "pie":
          return (
            <Pie ref={ref} data={chartData} options={options} height={200} />
          );
        default:
          return (
            <Bar ref={ref} data={chartData} options={options} height={200} />
          );
      }
    };

    return (
      <div style={{ height: "250px", padding: "10px" }}>{renderChart()}</div>
    );
  }
);

Chart.displayName = "Chart";

export default Chart;
