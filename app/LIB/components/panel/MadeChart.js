import WidgetCard from "./WidgetCard";
import { useEditorContext } from "../../context/EditorContext";
import {
  Button,
  Card,
  ColorPicker,
  Input,
  Segmented,
  Typography,
} from "sud-ui";
import Chart from "./ChartComponent/Chart";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  TbChartArea,
  TbChartBar,
  TbChartDotsFilled,
  TbChartLine,
  TbChartPie,
  TbChartRadar,
} from "react-icons/tb";
import { IoCopyOutline } from "react-icons/io5";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { inputProps } from "../../constant/uiProps";

export default function MadeChart({ dragHandleProps }) {
  const { selectedObject } = useEditorContext();
  const [tableData, setTableData] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [isAxesSwapped, setIsAxesSwapped] = useState(false);
  const [viewDataValue, setViewDataValue] = useState(false);
  const [viewLegend, setViewLegend] = useState(false);
  const chartRef = useRef(null);

  const [chartColors, setChartColors] = useState([]);
  const [openPickerIndex, setOpenPickerIndex] = useState(null);

  const [viewYLabel, setViewYLabel] = useState(true);
  const [ratio, setRatio] = useState("1/1");

  // 1. 테이블 데이터 추출 로직
  useEffect(() => {
    if (!selectedObject || selectedObject.node.type.name !== "table") {
      // 선택 해제 시 즉시 null로 날리지 말고, 정말 다른 걸 선택했을 때만 날림
      return;
    }

    const tableNode = selectedObject.node;
    const extracted = [];
    for (let i = 0; i < tableNode.childCount; i++) {
      const row = tableNode.child(i);
      const rowData = [];
      for (let j = 0; j < row.childCount; j++) {
        rowData.push(row.child(j).textContent || "");
      }
      extracted.push(rowData);
    }

    const newStr = JSON.stringify(extracted);
    if (newStr !== JSON.stringify(tableData)) {
      setTableData(extracted);
    }
  }, [selectedObject, tableData]);

  // 2. 색상 개수 계산
  const chartColorIndex = useMemo(() => {
    if (!tableData || tableData.length === 0) return 0;
    if (isAxesSwapped) {
      return chartType === "pie"
        ? tableData[0].length - 1
        : tableData.length - 1;
    } else {
      return chartType === "pie"
        ? tableData.length - 1
        : tableData[0].length - 1;
    }
  }, [tableData, isAxesSwapped, chartType]);

  // 3. ★ 색상 배열 동기화 (기존 색상을 보존하는 가드 추가)
  useEffect(() => {
    if (chartColorIndex <= 0) return;

    setChartColors((prev) => {
      // 개수가 줄어들거나 늘어났을 때만 조정하되, 기존 색상은 유지
      if (prev.length === chartColorIndex) return prev;

      const defaultColors = [
        "#13c2c2",
        "#1677ff",
        "#52c41a",
        "#eb4d28",
        "#a0d911",
        "#346aa3",
      ];
      const next = [...prev];

      if (next.length < chartColorIndex) {
        for (let i = next.length; i < chartColorIndex; i++) {
          next[i] = defaultColors[i % defaultColors.length];
        }
      }
      return next.slice(0, chartColorIndex);
    });
  }, [chartColorIndex]);

  const copyChartAsImage = async () => {
    if (!tableData || !chartRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const chartContainer = chartRef.current.closest("div");

      // 1. 배율 설정
      const captureScale = 2;
      const fontGrowthFactor = 1.2; // 최종 이미지에서 폰트가 원본의 1.2배만 되도록 설정
      const fontAdjustmentRatio = fontGrowthFactor / captureScale;

      const canvas = await html2canvas(chartContainer, {
        backgroundColor: "#ffffff",
        scale: captureScale,
        useCORS: true,
        logging: false, // 불필요한 로그 제거
        onclone: (clonedDoc) => {
          // 2. Recharts의 주요 텍스트 클래스들 타겟팅
          // .recharts-text: 일반 텍스트
          // .recharts-cartesian-axis-tick-value: 축 눈금 값
          // .recharts-label: 데이터 라벨 리스트
          const selectors =
            ".recharts-text, .recharts-cartesian-axis-tick-value, .recharts-label, text, tspan";
          const textElements = clonedDoc.querySelectorAll(selectors);

          textElements.forEach((el) => {
            // 3. 현재 폰트 크기 파악 (없으면 기본값 12px)
            const currentFontSize =
              parseFloat(window.getComputedStyle(el).fontSize) || 12;
            const newSize = `${currentFontSize * fontAdjustmentRatio}px`;

            // 4. 스타일(CSS)과 속성(Attribute) 둘 다 강제 적용
            el.style.setProperty("font-size", newSize, "important");

            if (
              el.tagName.toLowerCase() === "text" ||
              el.tagName.toLowerCase() === "tspan"
            ) {
              // SVG 요소는 setAttribute가 가장 확실합니다.
              el.setAttribute("font-size", newSize);
              // Recharts 특유의 위치 어긋남 방지를 위해 스타일로도 고정
              el.style.fontSize = newSize;
            }
          });
        },
      });

      canvas.toBlob(
        (blob) => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
          }
        },
        "image/png",
        1.0
      );
    } catch (e) {
      console.error("차트 복사 실패:", e);
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
          {tableData ? (
            <div className="flex flex-col gap-10 items-center w-100">
              <Segmented
                options={[
                  { value: "bar", label: <TbChartBar /> },
                  { value: "line", label: <TbChartLine /> },
                  { value: "area", label: <TbChartArea /> },
                  { value: "pie", label: <TbChartPie /> },
                  { value: "radar", label: <TbChartRadar /> },
                ]}
                value={chartType}
                onChange={setChartType}
                block
              />

              <div className="grid col-4 w-100 gap-10">
                <Button
                  size="sm"
                  onClick={() => setIsAxesSwapped(!isAxesSwapped)}
                >
                  <Typography size="sm" pretendard="SB">
                    X/Y 축 전환
                  </Typography>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewDataValue(!viewDataValue)}
                  background={!viewDataValue && "neutral-2"}
                  color={viewDataValue ? "blue" : "neutral"}
                >
                  <Typography size="sm" pretendard={viewDataValue && "SB"}>
                    데이터 값
                  </Typography>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewYLabel(!viewYLabel)}
                  background={!viewYLabel && "neutral-2"}
                  color={viewYLabel ? "blue" : "neutral"}
                >
                  <Typography size="sm" pretendard={viewYLabel && "SB"}>
                    Y축 라벨
                  </Typography>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewLegend(!viewLegend)}
                  background={!viewLegend && "neutral-2"}
                  color={viewLegend ? "blue" : "neutral"}
                >
                  <Typography size="sm" pretendard={viewLegend && "SB"}>
                    범례
                  </Typography>
                </Button>
              </div>

              {/* ★ 색상 선택 UI - 이벤트 전파 방지 추가 */}
              <div
                className={`grid col-${Math.min(
                  chartColorIndex,
                  7
                )} w-100 gap-10`}
                onMouseDown={(e) => e.stopPropagation()} // 에디터 포커스 뺏기 방지
              >
                {chartColors.map((color, index) => (
                  <div key={index} className="flex flex-col w-100">
                    <ColorPicker
                      className="w-100"
                      open={openPickerIndex === index}
                      setOpen={(isOpen) =>
                        setOpenPickerIndex(isOpen ? index : null)
                      }
                      color={color}
                      onChange={(c) => {
                        // ★ 여기서 상태를 업데이트할 때 확실하게 새 배열 생성
                        setChartColors((prev) => {
                          const next = [...prev];
                          next[index] = c.hex;
                          return next;
                        });
                        setOpenPickerIndex(null);
                      }}
                      mode="preset"
                    >
                      {/* Button의 background가 sud-ui에서 안 먹힐 경우를 대비해 style 병행 */}
                      <Button className="w-100" background={color} />
                    </ColorPicker>
                  </div>
                ))}
              </div>
              <Input
                {...inputProps}
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                prefix={"너비 / 높이 : "}
              />

              <Card shadow="none" width="100%">
                <Chart
                  tableData={tableData}
                  chartType={chartType}
                  isAxesSwapped={isAxesSwapped}
                  ref={chartRef}
                  viewDataValue={viewDataValue}
                  viewLegend={viewLegend}
                  chartColors={chartColors}
                  viewYLabel={viewYLabel}
                  ratio={ratio}
                />
              </Card>

              <Button
                icon={<IoCopyOutline size={16} />}
                onClick={copyChartAsImage}
                size="sm"
                border={false}
              />
            </div>
          ) : (
            <Typography color={"cool-gray-7"}>테이블을 선택하세요</Typography>
          )}
        </div>
      </div>
    </WidgetCard>
  );
}
