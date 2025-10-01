import { GiSouthKorea } from "react-icons/gi";
import WidgetCard from "./WidgetCard";
import {
  getDownloadURL,
  listAll,
  ref,
  storage,
} from "../../config/firebaseConfig";
import { Button, DotSpinner, Select, toast } from "sud-ui";
import { useEffect, useState } from "react";
import { Download } from "sud-icons";
import GeoJsonToSvg from "./GeoComponent/GeoJsonToSvg";
import { IoCopyOutline } from "react-icons/io5";

export default function GeoJson({ dragHandleProps }) {
  const [regionList, setRegionList] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geojsonData, setGeojsonData] = useState(null);
  const [svgElement, setSvgElement] = useState(null);

  // 지역 목록 가져오기
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const listRef = ref(storage, "geojson/");
        const res = await listAll(listRef);
        const files = res.items.map((itemRef) => itemRef.name);
        setRegionList(files);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    const fetchGeoJson = async () => {
      setLoading(true);
      try {
        const fileRef = ref(storage, `geojson/${region}`);
        const url = await getDownloadURL(fileRef);
        const response = await fetch(url);
        const data = await response.json();
        setGeojsonData(data);
      } catch (error) {
        console.error("Error fetching GeoJSON:", error);
      }
      setLoading(false);
    };

    if (region) {
      fetchGeoJson();
    }
  }, [region]);

  const downloadSvg = () => {
    if (!svgElement) return;

    // SVG 데이터를 string으로 변환
    const paths = svgElement.querySelectorAll("path");
    paths.forEach((path) => {
      path.setAttribute("fill", "darkcyan"); // 내부 색상을 설정
      path.setAttribute("stroke", "white"); // 경계선 색상을 설정
    });

    // SVG 데이터를 string으로 변환
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${region?.replace(".geojson", "") || "map"}.svg`;
    link.click();
  };

  const copySvgAsImage = async () => {
    if (!svgElement) return;

    try {
      // SVG 데이터를 string으로 변환
      const paths = svgElement.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("fill", "darkcyan");
        path.setAttribute("stroke", "white");
      });

      const svgData = new XMLSerializer().serializeToString(svgElement);

      // SVG를 Canvas로 변환하여 PNG로 만들기
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // 너비를 800으로 고정하고 비율에 맞게 높이 계산
        const targetWidth = 800;
        const aspectRatio = img.height / img.width;
        const targetHeight = Math.floor(targetWidth * aspectRatio);

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // 캔버스를 Blob으로 변환
        canvas.toBlob(
          async (blob) => {
            // 클립보드에 이미지 복사
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ]);

            toast.success("지도를 복사했습니다!");
          },
          "image/png",
          1.0
        );

        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error("복사 실패:", error);
    }
  };

  return (
    <WidgetCard
      icon={GiSouthKorea}
      title="행정지도"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        <Select
          shadow="none"
          size="sm"
          placeholder="지역을 선택하세요"
          searchable
          value={region}
          onChange={(value) => {
            setRegion(value);
          }}
          options={
            regionList
              ? regionList.map((item) => ({
                  label: item.replace(".geojson", ""),
                  value: item,
                }))
              : ["지역을 불러오는 중입니다..."]
          }
        />
        {loading ? (
          <DotSpinner />
        ) : geojsonData ? (
          <>
            <GeoJsonToSvg
              geojson={geojsonData}
              setSvgRef={setSvgElement}
              region={region}
            />
            <div className="flex justify-center gap-10">
              <Button
                icon={<Download size={16} />}
                onClick={downloadSvg}
                size="sm"
                border={false}
              />
              <Button
                icon={<IoCopyOutline size={16} />}
                onClick={copySvgAsImage}
                size="sm"
                border={false}
              />
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </WidgetCard>
  );
}
