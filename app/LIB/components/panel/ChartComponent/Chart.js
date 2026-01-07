/**
 * Chart.js - Recharts 기반 차트 컴포넌트
 *
 * 이 컴포넌트는 테이블 데이터를 받아서 다양한 형태의 차트로 시각화합니다.
 *
 * @component
 * @param {Array<Array<string>>} tableData - 테이블 데이터 (2차원 배열)
 *   - 첫 번째 행: 헤더 (데이터셋 이름)
 *   - 나머지 행: 데이터 (첫 번째 열은 라벨, 나머지는 값)
 * @param {string} chartType - 차트 타입 ("bar" | "line" | "area" | "pie" | "radar")
 * @param {boolean} isAxesSwapped - 축 전환 여부 (true: 행/열 교체)
 * @param {React.Ref} ref - 차트 컨테이너 DOM 참조
 *
 * 지원하는 차트 타입:
 * - bar: 막대 그래프
 * - line: 선 그래프
 * - area: 영역 그래프
 * - pie: 원형 차트
 * - radar: 레이더 차트
 */

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Typography } from "sud-ui";

const Chart = React.forwardRef(
  (
    {
      tableData,
      chartType,
      isAxesSwapped = false,
      viewDataValue = false,
      viewLegend = false,
      chartColors = [],
      viewYLabel = true,
      ratio = "1/1",
    },
    ref
  ) => {
    /**
     * 테이블 데이터를 Recharts 형식으로 변환하는 함수
     *
     * 입력 형식 (테이블):
     *   [헤더행: ["라벨", "데이터셋1", "데이터셋2", ...],
     *    데이터행1: ["라벨1", "10", "20", ...],
     *    데이터행2: ["라벨2", "30", "40", ...]]
     *
     * 출력 형식 (Recharts):
     *   {
     *     data: [
     *       {name: "라벨1", 데이터셋1: 10, 데이터셋2: 20},
     *       {name: "라벨2", 데이터셋1: 30, 데이터셋2: 40}
     *     ],
     *     keys: ["데이터셋1", "데이터셋2", ...]
     *   }
     *
     * @returns {Object|null} 변환된 차트 데이터 또는 null (데이터 없음)
     */
    const getChartData = () => {
      // 유효성 검사: 최소 2행 필요 (헤더 + 데이터)
      if (!tableData || tableData.length < 2) return null;

      let processedData = tableData;

      /**
       * 축 전환 처리
       * isAxesSwapped가 true인 경우 행과 열을 교체 (transpose)
       * 예:
       *   원본: [[A,B], [1,2], [3,4]]
       *   전환: [[A,1,3], [B,2,4]]
       */
      if (isAxesSwapped) {
        const maxCols = Math.max(...tableData.map((row) => row.length));
        processedData = [];
        // 각 컬럼을 행으로 변환
        for (let colIndex = 0; colIndex < maxCols; colIndex++) {
          const newRow = [];
          for (let rowIndex = 0; rowIndex < tableData.length; rowIndex++) {
            // 빈 셀은 빈 문자열로 처리
            newRow.push(tableData[rowIndex][colIndex] || "");
          }
          processedData.push(newRow);
        }
      }

      const headers = processedData[0]; // 첫 번째 행은 헤더 (데이터셋 이름들)
      const dataRows = processedData.slice(1); // 나머지는 실제 데이터 행들

      /**
       * Recharts 형식으로 데이터 변환
       * 각 데이터 행을 객체로 변환:
       *   - name: 첫 번째 컬럼 (X축 라벨)
       *   - 나머지 컬럼: 헤더 이름을 키로 하는 값들
       */
      const rechartsData = dataRows.map((row) => {
        const dataPoint = {
          name: row[0] || "", // 첫 번째 컬럼은 name (X축 라벨로 사용됨)
        };
        // 나머지 컬럼들을 데이터셋으로 변환
        // headers.slice(1)은 첫 번째 헤더(라벨)를 제외한 데이터셋 이름들
        headers.slice(1).forEach((header, index) => {
          const value = parseFloat(row[index + 1]);
          // 숫자가 아닌 경우 0으로 처리
          dataPoint[header] = isNaN(value) ? 0 : value;
        });
        return dataPoint;
      });

      return {
        data: rechartsData, // Recharts가 사용할 데이터 배열
        keys: headers.slice(1), // 데이터셋 키들 (각 차트 시리즈의 이름)
      };
    };

    const chartDataInfo = getChartData();

    /**
     * 차트 타입에 따라 적절한 Recharts 컴포넌트를 렌더링하는 함수
     *
     * 각 차트 타입별 커스터마이징 옵션:
     * - 모든 차트: ResponsiveContainer로 반응형 처리
     * - 공통 요소: XAxis, YAxis, Tooltip, Legend 등
     */
    const renderChart = () => {
      // 데이터 유효성 검사
      if (
        !chartDataInfo ||
        !chartDataInfo.data ||
        chartDataInfo.data.length === 0
      ) {
        return (
          <Typography color="cool-gray-7">차트 데이터가 없습니다</Typography>
        );
      }

      const { data, keys } = chartDataInfo;

      const legendProps = {
        verticalAlign: "bottom",
        horizontalAlign: "center",
        wrapperStyle: {
          paddingTop: "20px",
          fontSize: "14px",
          color: "cool-gray-7",
        },
      };

      switch (chartType) {
        /**
         * 막대 그래프 (Bar Chart)
         *
         * Bar 컴포넌트 커스터마이징 옵션:
         * - fill: 막대 색상 (현재: getColorForKey로 동적 생성)
         * - stroke: 막대 테두리 색상
         * - strokeWidth: 테두리 두께
         * - radius: [topLeft, topRight, bottomRight, bottomLeft] - 모서리 둥글기
         * - maxBarSize: 최대 막대 너비 (숫자)
         * - stackId: 같은 stackId를 가진 Bar는 쌓임
         *
         * BarChart 커스터마이징 옵션:
         * - layout: "horizontal" | "vertical" - 막대 방향
         * - barCategoryGap: 카테고리 간격 (퍼센트 또는 숫자)
         * - barGap: 데이터셋 간격 (퍼센트)
         * - margin: {top, right, bottom, left} - 여백
         */

        case "bar":
          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 10, bottom: 5, left: 0 }}
              >
                {/* 격자선: strokeDasharray로 점선 스타일 지정 */}
                {/* <CartesianGrid strokeDasharray="1 1" /> */}
                {/* X축: dataKey로 라벨 데이터 지정 */}
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                {/* Y축: 자동 스케일 */}
                {viewYLabel && <YAxis fontSize={12} tickLine={false} />}
                {/* 툴팁: 마우스 오버 시 데이터 표시 */}
                {/* <Tooltip /> */}
                {/* 범례: 데이터셋 이름 표시 */}
                {viewLegend && <Legend {...legendProps} />}

                {/* 각 데이터셋에 대해 Bar 생성 */}
                {keys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={chartColors[index] || "#cccccc"}
                    // 커스터마이징 예시 (필요시 주석 해제):
                    radius={[5, 5, 0, 0]} // 상단 모서리 둥글게
                    // maxBarSize={50}         // 최대 막대 너비
                  >
                    {viewDataValue && (
                      <LabelList
                        dataKey={key}
                        position="top"
                        fontSize={12}
                        offset={5}
                      />
                    )}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          );
        /**
         * 선 그래프 (Line Chart)
         *
         * Line 컴포넌트 커스터마이징 옵션:
         * - type: "basis" | "basisClosed" | "basisOpen" | "linear" | "linearClosed" | "natural" | "monotone" | "monotoneX" | "monotoneY" | "step" | "stepBefore" | "stepAfter"
         *   현재: "monotone" (부드러운 곡선)
         * - stroke: 선 색상
         * - strokeWidth: 선 두께 (현재: 2)
         * - strokeDasharray: 점선 패턴 (예: "5 5")
         * - dot: true | false | <Dot /> - 데이터 포인트 표시
         * - dotRadius: 포인트 반지름
         * - activeDot: 활성 포인트 커스터마이징
         * - connectNulls: null 값 연결 여부
         *
         * LineChart 커스터마이징 옵션:
         * - margin: {top, right, bottom, left}
         */
        case "line":
          return (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 0,
                  left: viewYLabel ? 0 : 20,
                }}
              >
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                {viewYLabel && <YAxis fontSize={12} tickLine={false} />}
                {/* <Tooltip /> */}
                {viewLegend && <Legend {...legendProps} />}
                {keys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone" // 부드러운 곡선 (linear: 직선, step: 계단형)
                    dataKey={key}
                    stroke={chartColors[index] || "#cccccc"}
                    strokeWidth={1} // 선 두께
                    // 커스터마이징 예시 (필요시 주석 해제):
                    dot={{ r: 2 }} // 데이터 포인트 표시
                    // strokeDasharray="5 5"       // 점선으로 변경
                    connectNulls={true} // null 값 연결
                  >
                    {viewDataValue && (
                      <LabelList
                        dataKey={key}
                        position="top"
                        fontSize={12}
                        offset={index % 2 === 0 ? 10 : -15}
                      />
                    )}
                  </Line>
                ))}
              </LineChart>
            </ResponsiveContainer>
          );
        /**
         * 영역 그래프 (Area Chart)
         *
         * Area 컴포넌트 커스터마이징 옵션:
         * - type: Line과 동일 (현재: "monotone")
         * - fill: 채우기 색상
         * - fillOpacity: 채우기 투명도 (0-1)
         * - stroke: 테두리 색상
         * - strokeWidth: 테두리 두께
         * - stackId: 같은 stackId를 가진 Area는 쌓임 (현재: 모두 "1"로 쌓임)
         *   stackId를 다르게 하면 겹쳐서 표시
         * - dot: 포인트 표시 여부
         * - activeDot: 활성 포인트 커스터마이징
         */
        case "area":
          return (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 0,
                  left: viewYLabel ? 0 : 20,
                }}
              >
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                {viewYLabel && <YAxis fontSize={12} tickLine={false} />}
                {/* <Tooltip /> */}
                {viewLegend && <Legend {...legendProps} />}
                {keys.map((key, index) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId={key} // 각각 별도로 겹쳐서 표시 (같은 stackId면 쌓임)
                    stroke={chartColors[index] || "#cccccc"}
                    fill={chartColors[index] || "#cccccc"}
                    // 커스터마이징 예시 (필요시 주석 해제):
                    fillOpacity={0.2} // 투명도 조절
                    strokeWidth={1} // 테두리 두께
                  >
                    {viewDataValue && (
                      <LabelList
                        dataKey={key}
                        position="top"
                        fontSize={12}
                        offset={5}
                      />
                    )}
                  </Area>
                ))}
              </AreaChart>
            </ResponsiveContainer>
          );
        /**
         * 원형 차트 (Pie Chart)
         *
         * 주의: 파이 차트는 첫 번째 데이터셋만 사용합니다.
         * 여러 데이터셋이 있어도 keys[0]의 데이터만 표시됩니다.
         *
         * Pie 컴포넌트 커스터마이징 옵션:
         * - cx, cy: 중심 좌표 ("50%", 숫자 등)
         * - outerRadius: 외부 반지름 (현재: 80)
         * - innerRadius: 내부 반지름 (도넛 차트로 만들려면 값 지정)
         * - startAngle: 시작 각도 (0-360)
         * - endAngle: 끝 각도 (0-360)
         * - paddingAngle: 조각 간 간격 (숫자)
         * - label: true | false | function | ReactNode - 라벨 표시
         * - labelLine: true | false | <LabelLine /> - 라벨 선 표시
         * - dataKey: 데이터 값 키 (현재: "value")
         * - nameKey: 이름 키 (기본: "name")
         * - fill: 기본 색상 (Cell로 오버라이드됨)
         * - animationBegin: 애니메이션 시작 지연
         * - animationDuration: 애니메이션 지속 시간
         *
         * Cell 컴포넌트: 각 조각의 개별 스타일 지정
         * - fill: 색상
         * - stroke: 테두리 색상
         * - strokeWidth: 테두리 두께
         */
        case "pie":
          // 파이 차트는 첫 번째 데이터셋만 사용 (keys[0])
          const pieData = data.map((item) => ({
            name: item.name,
            value: item[keys[0]] || 0,
          }));
          return (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" // 중심 X 좌표
                  cy="50%" // 중심 Y 좌표
                  fill="#8884d8" // 기본 색상 (Cell에서 오버라이드됨)
                  dataKey="value" // 값에 사용할 키
                  // 커스터마이징 예시 (필요시 주석 해제):
                  // innerRadius={40}         // 도넛 차트로 만들기
                  // startAngle={90} // 90도부터 시작
                  // paddingAngle={2} // 조각 간 간격
                  label={false} // 라벨 숨기기
                >
                  {viewDataValue && (
                    <LabelList
                      dataKey="value"
                      position="inside"
                      fill="white"
                      stroke="none"
                      fontSize={12}
                      offset={0}
                    />
                  )}
                  {/* 각 조각에 다른 색상 적용 */}
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index] || "#cccccc"}
                      stroke={"#ffffff"}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                {/* <Tooltip /> */}
                {viewLegend && <Legend {...legendProps} />}
              </PieChart>
            </ResponsiveContainer>
          );
        /**
         * 레이더 차트 (Radar Chart / Spider Chart)
         *
         * 다차원 데이터를 극좌표계로 표현하는 차트입니다.
         *
         * Radar 컴포넌트 커스터마이징 옵션:
         * - stroke: 선 색상
         * - strokeWidth: 선 두께
         * - fill: 채우기 색상
         * - fillOpacity: 채우기 투명도 (0-1, 현재: 0.6)
         * - dot: true | false | <Dot /> - 포인트 표시
         * - activeDot: 활성 포인트 커스터마이징
         * - connectNulls: null 값 연결 여부
         *
         * PolarGrid 컴포넌트: 극좌표계 격자선
         * - strokeDasharray: 점선 패턴
         *
         * PolarAngleAxis 컴포넌트: 각도축 (라벨 표시)
         * - dataKey: 라벨에 사용할 데이터 키 (현재: "name")
         * - tick: true | false | function | ReactNode - 눈금 표시
         * - tickFormatter: 눈금 텍스트 포맷 함수
         *
         * PolarRadiusAxis 컴포넌트: 반경축 (값 표시)
         * - angle: 축이 위치할 각도 (0-360, 현재: 90도)
         * - domain: [min, max] - 값 범위 (현재: 0부터 최대값까지)
         * - tick: 눈금 표시
         * - tickCount: 눈금 개수
         * - tickFormatter: 눈금 텍스트 포맷 함수
         */
        case "radar":
          return (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data}>
                {/* 극좌표계 격자선 */}
                <PolarGrid />
                {/* 각도축: 라벨 표시 */}
                <PolarAngleAxis dataKey="name" fontSize={12} tickLine={false} />
                {/* 반경축: 값 범위 표시 */}
                {/* <PolarRadiusAxis
                  angle={90} // 90도 위치
                  domain={[0, "dataMax"]} // 0부터 최대값까지
                  // 커스터마이징 예시:
                  // tickCount={5}         // 눈금 개수
                /> */}
                {/* <Tooltip /> */}
                {viewLegend && <Legend {...legendProps} />}
                {keys.map((key, index) => (
                  <Radar
                    key={key}
                    name={key}
                    dataKey={key}
                    stroke={chartColors[index] || "#cccccc"}
                    fill={chartColors[index] || "#cccccc"}
                    fillOpacity={0.2} // 투명도
                    // 커스터마이징 예시 (필요시 주석 해제):
                    strokeWidth={1} // 선 두께
                    // dot={{ r: 2 }} // 포인트 표시
                  >
                    {viewDataValue && (
                      <LabelList
                        dataKey={key}
                        position="top"
                        fontSize={12}
                        offset={5}
                      />
                    )}
                  </Radar>
                ))}
              </RadarChart>
            </ResponsiveContainer>
          );
        default:
          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis dataKey="name" tickLine={false} />
                {viewYLabel && <YAxis tickLine={false} />}
                {/* <Tooltip /> */}
                {viewLegend && <Legend {...legendProps} />}
                {keys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={chartColors[index] || "#cccccc"}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          );
      }
    };

    /**
     * 차트 컨테이너 렌더링
     *
     * 커스터마이징 가능한 스타일:
     * - height: 차트 높이 (현재: "250px")
     * - padding: 내부 여백 (현재: "10px")
     * - width: 너비 (기본: 100%)
     *
     * ref는 MadeChart.js에서 이미지 복사 기능에 사용됩니다.
     */
    const [ratioW, ratioH] = ratio.split("/").map(Number);

    return (
      <div
        ref={ref}
        style={{
          aspectRatio: `${ratioW} / ${ratioH}`,
          width: "100%",
        }}
      >
        {renderChart()}
      </div>
    );
  }
);

Chart.displayName = "Chart";

/**
 * 공통 컴포넌트 커스터마이징 옵션 모음
 *
 * ========== XAxis / YAxis (축 설정) ==========
 * - dataKey: 데이터 키 (XAxis만)
 * - type: "number" | "category" | 기본값
 * - domain: [min, max] - 값 범위 (예: [0, 100], ["auto", "auto"])
 * - tick: true | false | function | ReactNode - 눈금 표시
 * - tickCount: 눈금 개수
 * - tickFormatter: (value) => string - 눈금 텍스트 포맷 함수
 * - label: string | ReactNode - 축 라벨
 * - angle: 라벨 회전 각도 (-90 ~ 90)
 * - dy: 라벨 Y축 오프셋
 * - dx: 라벨 X축 오프셋
 * - tickMargin: 눈금과 라벨 사이 간격
 * - fontSize: 폰트 크기
 * - fontWeight: 폰트 굵기
 * - stroke: 축 색상
 * - width: 축 선 두께
 *
 * ========== CartesianGrid (격자선) ==========
 * - strokeDasharray: 점선 패턴 (예: "3 3")
 * - stroke: 격자선 색상
 * - strokeWidth: 격자선 두께
 * - vertical: 수직선 표시 여부
 * - horizontal: 수평선 표시 여부
 *
 * ========== Tooltip (툴팁) ==========
 * - formatter: (value, name, props) => ReactNode - 값 포맷 함수
 * - labelFormatter: (label) => ReactNode - 라벨 포맷 함수
 * - content: ReactNode | function - 커스텀 툴팁 컴포넌트
 * - cursor: true | false | <Cursor /> - 커서 표시
 * - separator: ":" - 라벨과 값 구분자
 * - contentStyle: CSS 스타일 객체
 * - labelStyle: 라벨 스타일
 * - itemStyle: 항목 스타일
 * - wrapperStyle: 래퍼 스타일
 *
 * ========== Legend (범례) ==========
 * - align: "left" | "center" | "right" - 정렬
 * - verticalAlign: "top" | "middle" | "bottom" - 수직 정렬
 * - layout: "horizontal" | "vertical" - 배치 방향
 * - iconType: "line" | "square" | "rect" | "circle" | "cross" | "diamond" | "star" | "triangle" | "wye"
 * - formatter: (value) => string - 텍스트 포맷 함수
 * - wrapperStyle: CSS 스타일 객체
 * - iconSize: 아이콘 크기
 * - payload: 커스텀 항목들
 *
 * ========== ResponsiveContainer (반응형 컨테이너) ==========
 * - width: 너비 ("100%", 숫자)
 * - height: 높이 ("100%", 숫자)
 * - aspect: 가로세로 비율 (width/height)
 * - minWidth: 최소 너비
 * - minHeight: 최소 높이
 * - maxHeight: 최대 높이
 *
 * ========== 색상 커스터마이징 예시 ==========
 *
 * // 1. 단일 색상 사용
 * fill="#FF6384"
 *
 * // 2. 투명도 포함
 * fill="rgba(255, 99, 132, 0.5)"
 *
 * // 3. 그라데이션 (BarChart 등에서 사용)
 * <defs>
 *   <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
 *     <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
 *     <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
 *   </linearGradient>
 * </defs>
 * <Bar fill="url(#colorGradient)" />
 *
 * ========== 데이터 포맷팅 예시 ==========
 *
 * // Tooltip 포맷팅
 * <Tooltip
 *   formatter={(value) => `${value.toLocaleString()}개`}
 *   labelFormatter={(label) => `날짜: ${label}`}
 * />
 *
 * // YAxis 포맷팅
 * <YAxis
 *   tickFormatter={(value) => `${value}%`}
 * />
 *
 * ========== 애니메이션 커스터마이징 ==========
 *
 * // Bar/Line/Area 등에서 애니메이션 제어
 * <Bar
 *   isAnimationActive={true}  // 애니메이션 활성화
 *   animationBegin={0}         // 시작 지연 (ms)
 *   animationDuration={800}    // 지속 시간 (ms)
 *   animationEasing="ease-in-out"  // 이징 함수
 * />
 *
 * ========== 이벤트 핸들링 ==========
 *
 * // 클릭 이벤트
 * <Bar
 *   onClick={(data, index) => console.log(data, index)}
 * />
 *
 * // 마우스 오버
 * <Bar
 *   onMouseEnter={(data, index) => console.log('Enter', data)}
 *   onMouseLeave={(data, index) => console.log('Leave', data)}
 * />
 */

export default Chart;
