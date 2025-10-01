import React, { useRef, useEffect } from "react";
import { Card, Div } from "sud-ui";

// 지도 전체를 500px 크기 안에 맞추기 위한 스케일링 적용
const VIEWBOX_SIZE = 500; // SVG의 뷰박스 크기

// 좌표의 최소값과 최대값을 계산해 전체 경계 크기를 구하는 함수
const calculateBounds = (features) => {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  features.forEach((feature) => {
    const { type, coordinates } = feature.geometry;

    if (type === "Polygon") {
      coordinates.forEach((polygon) => {
        polygon.forEach(([x, y]) => {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        });
      });
    } else if (type === "MultiPolygon") {
      coordinates.forEach((multiPolygon) => {
        multiPolygon.forEach((polygon) => {
          polygon.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          });
        });
      });
    }
  });

  return { minX, minY, maxX, maxY };
};

// 중심 좌표 계산 함수
const calculateCenter = (minX, minY, maxX, maxY) => {
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return [centerX, centerY];
};

const GeoJsonToSvg = ({ geojson, setSvgRef, region }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (setSvgRef) {
      setSvgRef(svgRef.current); // 부모 컴포넌트에 SVG 참조 전달
    }
  }, [setSvgRef]);

  // 좌표 변환 및 스케일링
  const convertGeoJSONToSVGPath = (geometry, center, scaleFactor) => {
    const roundToTwoDecimals = (num) => parseFloat(num.toFixed(2));

    if (geometry.type === "Polygon") {
      return geometry.coordinates
        .map((polygon) => {
          return (
            polygon
              .map(([x, y], index) => {
                const scaledX = roundToTwoDecimals(
                  (x - center[0]) * scaleFactor + VIEWBOX_SIZE / 2
                );
                const scaledY = roundToTwoDecimals(
                  -(y - center[1]) * scaleFactor + VIEWBOX_SIZE / 2
                );

                return index === 0
                  ? `M${scaledX} ${scaledY}`
                  : `L${scaledX} ${scaledY}`;
              })
              .join(" ") + " Z"
          );
        })
        .join(" ");
    }

    if (geometry.type === "MultiPolygon") {
      return geometry.coordinates
        .map((multiPolygon) => {
          return multiPolygon
            .map((polygon) => {
              return (
                polygon
                  .map(([x, y], index) => {
                    const scaledX = roundToTwoDecimals(
                      (x - center[0]) * scaleFactor + VIEWBOX_SIZE / 2
                    );
                    const scaledY = roundToTwoDecimals(
                      -(y - center[1]) * scaleFactor + VIEWBOX_SIZE / 2
                    );

                    return index === 0
                      ? `M${scaledX} ${scaledY}`
                      : `L${scaledX} ${scaledY}`;
                  })
                  .join(" ") + " Z"
              );
            })
            .join(" ");
        })
        .join(" ");
    }

    return "";
  };

  // 경계선 그리기
  if (!geojson) return null;

  // 경계의 최소/최대 좌표를 계산
  const { minX, minY, maxX, maxY } = calculateBounds(geojson.features);

  // 전체 중앙 계산
  const center = calculateCenter(minX, minY, maxX, maxY);

  // 전체 크기에 맞게 스케일링 계산
  const geoWidth = maxX - minX;
  const geoHeight = maxY - minY;
  const scaleFactor = Math.min(
    VIEWBOX_SIZE / geoWidth,
    VIEWBOX_SIZE / geoHeight
  );

  return (
    <Card width="100%" shadow="none" background="mint-1" border={false}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} // 뷰박스 크기 조정
        xmlns="http://www.w3.org/2000/svg"
        style={{
          maxWidth: "100%", // 화면에 맞게 크기가 변하게 함
          width: "auto", // 넓이를 자동으로 설정
          height: "auto", // 높이를 자동으로 설정
        }}
      >
        {geojson.features.map((feature, index) => (
          <path
            key={index}
            d={convertGeoJSONToSVGPath(feature.geometry, center, scaleFactor)}
            stroke="white"
            fill="darkcyan"
          />
        ))}
      </svg>
    </Card>
  );
};

export default GeoJsonToSvg;
