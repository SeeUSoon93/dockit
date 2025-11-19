import React, { useRef, useEffect, useMemo } from "react";
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

    const checkPoint = ([x, y]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    };

    if (type === "Polygon") {
      coordinates.forEach((polygon) => polygon.forEach(checkPoint));
    } else if (type === "MultiPolygon") {
      coordinates.forEach((multi) =>
        multi.forEach((poly) => poly.forEach(checkPoint))
      );
    }
  });

  return { minX, minY, maxX, maxY };
};

// 중심 좌표 계산 함수
const calculateCenter = (minX, minY, maxX, maxY) => {
  return [(minX + maxX) / 2, (minY + maxY) / 2];
};

const GeoJsonToSvg = ({ geojson, setSvgRef, region, scale, setScale }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (setSvgRef) {
      setSvgRef(svgRef.current); // 부모 컴포넌트에 SVG 참조 전달
    }
  }, [setSvgRef]);

  const { bounds, center, scaleFactor, geoWidth, geoHeight } = useMemo(() => {
    if (!geojson) return {};

    const { minX, minY, maxX, maxY } = calculateBounds(geojson.features);
    const width = maxX - minX;
    const height = maxY - minY;

    // 0으로 나누기 방지
    const safeWidth = width || 1;
    const safeHeight = height || 1;

    const scale = Math.min(VIEWBOX_SIZE / safeWidth, VIEWBOX_SIZE / safeHeight);
    const centerCoord = calculateCenter(minX, minY, maxX, maxY);

    return {
      bounds: { minX, minY, maxX, maxY },
      center: centerCoord,
      scaleFactor: scale,
      geoWidth: safeWidth,
      geoHeight: safeHeight,
    };
  }, [geojson]);

  // 좌표 변환 및 스케일링
  const convertGeoJSONToSVGPath = (geometry) => {
    const roundToTwoDecimals = (num) => parseFloat(num.toFixed(2));

    const THRESHOLD_RATIO = scale / 100;

    // 폴리곤이 전체 지도 대비 너무 작은지 검사하는 함수
    const isTooSmall = (polygon) => {
      let pMinX = Infinity,
        pMaxX = -Infinity,
        pMinY = Infinity,
        pMaxY = -Infinity;

      for (let i = 0; i < polygon.length; i++) {
        const [x, y] = polygon[i];
        if (x < pMinX) pMinX = x;
        if (x > pMaxX) pMaxX = x;
        if (y < pMinY) pMinY = y;
        if (y > pMaxY) pMaxY = y;
      }

      const polyWidth = pMaxX - pMinX;
      const polyHeight = pMaxY - pMinY;

      // 해당 폴리곤의 가로와 세로가 모두 전체 지도의 일정 비율보다 작으면 제외
      return (
        polyWidth / geoWidth < THRESHOLD_RATIO &&
        polyHeight / geoHeight < THRESHOLD_RATIO
      );
    };

    const pointsToPath = (polygon) => {
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
    };

    if (geometry.type === "Polygon") {
      return geometry.coordinates
        .filter((polygon) => !isTooSmall(polygon)) // 비율 기반 필터링 적용
        .map(pointsToPath)
        .join(" ");
    }

    if (geometry.type === "MultiPolygon") {
      return geometry.coordinates
        .map((multiPolygon) => {
          return multiPolygon
            .filter((polygon) => !isTooSmall(polygon)) // 비율 기반 필터링 적용
            .map(pointsToPath)
            .join(" ");
        })
        .join(" "); // 필터링 되어 path가 비어도 SVG에서는 문제없음
    }

    return "";
  };

  // 경계선 그리기
  if (!geojson || !bounds) return null;

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
        {geojson.features.map((feature, index) => {
          // path 데이터 생성
          const pathData = convertGeoJSONToSVGPath(feature.geometry);
          // 다 걸러져서 빈 문자열이면 렌더링 안함
          if (!pathData.trim()) return null;

          return (
            <path
              key={index}
              d={pathData}
              fill="darkcyan"
              stroke="white"
              // strokeWidth도 스케일에 따라 너무 굵어 보일 수 있으니 조절 가능
              strokeWidth={0.5}
            />
          );
        })}
      </svg>
    </Card>
  );
};

export default GeoJsonToSvg;
