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
  Legend
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Typography } from "sud-ui";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Chart = React.forwardRef(({ tableData, chartType }, ref) => {
  // 차트 데이터 가공
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
        tension: chartType === "line" ? 0.4 : 0, // 선 그래프일 때만 곡선 적용
        fill: false // 선 그래프 아래쪽 채우지 않음
      }))
    };
  };

  const chartData = getChartData();

  const renderChart = () => {
    if (!chartData)
      return (
        <Typography color="cool-gray-7">차트 데이터가 없습니다</Typography>
      );

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
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
});

Chart.displayName = "Chart";

export default Chart;
