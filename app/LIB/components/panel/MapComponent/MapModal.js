import { Card, Modal, Select } from "sud-ui";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapModal() {
  const mapInstanceRef = useRef(null);

  const selectProps = {
    size: "sm",
    style: { width: "100px" }
  };

  // 지도 유형
  const [mapType, setMapType] = useState("Base");
  const mapTypeOptions = [
    { label: "기본", value: "Base" },
    { label: "흰색", value: "White" },
    { label: "다크", value: "Dark" },
    { label: "위성", value: "Satellite" }
  ];

  // 타일 레이어 맵
  const getTileLayer = (type) => {
    const layers = {
      Base: L.tileLayer(
        "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}",
        {
          maxZoom: 20,
          attribution:
            '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          ext: "png"
        }
      ),
      White: L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20
        }
      ),
      Dark: L.tileLayer(
        "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}",
        {
          maxZoom: 20,
          attribution:
            '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          ext: "png"
        }
      ),
      Satellite: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 20,
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        }
      )
    };
    return layers[type] || layers.Base;
  };

  useEffect(() => {
    const defaultCenter = [37.5665, 126.978]; // 서울시청 [위도, 경도]

    // 지도가 이미 있으면 레이어만 업데이트
    if (mapInstanceRef.current) {
      mapInstanceRef.current.eachLayer((layer) => {
        mapInstanceRef.current.removeLayer(layer);
      });
      getTileLayer(mapType).addTo(mapInstanceRef.current);
      return;
    }

    // 최초 지도 생성
    mapInstanceRef.current = L.map("v-map", {
      center: defaultCenter,
      zoom: 12,
      zoomControl: true
    });

    getTileLayer(mapType).addTo(mapInstanceRef.current);

    // 사용자 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstanceRef.current.setView([latitude, longitude], 15);
        },
        (error) => {
          console.log(
            "위치 정보를 가져올 수 없습니다. 기본 위치(서울시청)를 사용합니다.",
            error
          );
        }
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapType]);

  return (
    <div className="relative">
      {/* 지도 */}
      <div id="v-map" style={{ width: "100%", height: "90vh" }} />

      {/* 지도 타입 선택 */}
      <div className="absolute top-px-10 right-px-10" style={{ zIndex: 1000 }}>
        <Select
          options={mapTypeOptions}
          onChange={(value) => setMapType(value)}
          value={mapType}
          {...selectProps}
        />
      </div>
    </div>
  );
}
