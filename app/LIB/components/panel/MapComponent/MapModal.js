"use client";

import { Card, Modal, Select, Input } from "sud-ui";

import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import { inputProps } from "@/app/LIB/constant/uiProps";
import { useDarkMode } from "@/app/LIB/context/DarkModeContext";

export default function MapModal({ searchTerm, setSearchTerm }) {
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const { isDarkMode } = useDarkMode();

  const selectProps = {
    size: "sm",
    style: { width: "100px" }
  };

  // 지도 유형
  const [mapType, setMapType] = useState(isDarkMode ? "Dark" : "Base");
  const mapTypeOptions = [
    { label: "기본", value: "White" },
    { label: "위성", value: "Satellite" }
  ];

  // 검색 상태
  const [searchQuery, setSearchQuery] = useState(searchTerm);

  // 커스텀 마커 아이콘 정의 (useMemo로 최적화)
  const customIcons = useMemo(() => {
    const createCustomIcon = (color = "#3b82f6", size = [32, 32]) => {
      return L.icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="${size[0]}" height="${size[1]}" viewBox="0 0 24 24">
            <path fill="${color}" d="M12,2c-4.4106636,0-8,3.2363591-8,7.213275,0,4.6789999,5.0177794,10.2740602,7.1760015,12.4621477.4266939.4327698,1.2222462.4327698,1.6479969,0,2.1573582-2.1880875,7.1760015-7.7831478,7.1760015-12.4621477,0-3.9769158-3.5893364-7.213275-8-7.213275Z"/>
            <path fill="#fff" d="M12,12.2132397c-1.6539564,0-3-1.3460245-3-2.9999561,0-1.6540198,1.3460436-3.0000439,3-3.0000439,1.6540442,0,3,1.346024,3,3.0000439,0,1.6539316-1.3459558,2.9999561-3,2.9999561Z"/>
          </svg>
        `)}`,
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1]],
        popupAnchor: [0, -size[1]],
        shadowSize: [size[0], size[1]]
      });
    };

    return {
      blue: createCustomIcon("#3b82f6", [32, 32]),
      red: createCustomIcon("#ef4444", [32, 32]),
      green: createCustomIcon("#10b981", [32, 32]),
      purple: createCustomIcon("#8b5cf6", [32, 32]),
      orange: createCustomIcon("#f59e0b", [32, 32])
    };
  }, []);

  // 검색 함수
  const handleSearch = async (query) => {
    if (!query.trim()) return;
    setSearchTerm(query);

    try {
      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query });

      if (results && results.length > 0) {
        const result = results[0];
        const { y: latitude, x: longitude } = result;
        mapInstanceRef.current.setView([latitude, longitude], 15);

        // 기존 마커 제거
        mapInstanceRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        // 검색된 위치에 마커 추가
        L.marker([latitude, longitude], { icon: customIcons.red })
          .addTo(mapInstanceRef.current)
          .bindPopup(`검색 결과: ${result.label}`)
          .openPopup();
      }
    } catch (error) {
      console.log("검색 중 오류가 발생했습니다:", error);
    }
  };

  // 타일 레이어 맵
  const getTileLayer = (type) => {
    const layers = {
      White: L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20
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

    // 지도가 이미 있으면 타일 레이어만 업데이트
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = getTileLayer(mapType);
      tileLayerRef.current.addTo(mapInstanceRef.current);
      return;
    }

    // 최초 지도 생성
    mapInstanceRef.current = L.map("v-map", {
      center: defaultCenter,
      zoom: 12,
      zoomControl: true
    });

    // 타일 레이어 추가
    tileLayerRef.current = getTileLayer(mapType);
    tileLayerRef.current.addTo(mapInstanceRef.current);

    // 1. Geoman 플러그인 (그리기, 마커, 도형, 측정)
    mapInstanceRef.current.pm.addControls({
      position: "topleft",
      drawCircle: true,
      drawMarker: true,
      drawCircleMarker: true,
      drawPolyline: true,
      drawRectangle: true,
      drawPolygon: true,
      editMode: true,
      dragMode: true,
      cutPolygon: true,
      removalMode: true,
      rotateMode: true
    });

    // 측정 기능 활성화
    mapInstanceRef.current.pm.setGlobalOptions({
      measurements: {
        measurement: true,
        displayFormat: "metric"
      }
    });

    // Geoman 마커에 커스텀 아이콘 설정
    mapInstanceRef.current.pm.setGlobalOptions({
      markerStyle: {
        icon: customIcons.blue
      }
    });

    // Geoman 한글화
    mapInstanceRef.current.pm.setLang("ko", {
      tooltips: {
        placeMarker: "클릭하여 마커 추가",
        drawPolyline: "클릭하여 선 그리기",
        drawRectangle: "클릭하여 사각형 그리기",
        drawPolygon: "클릭하여 다각형 그리기",
        drawCircle: "클릭하여 원 그리기",
        editMode: "편집 모드",
        dragMode: "드래그 모드",
        cutPolygon: "다각형 자르기",
        removalMode: "삭제 모드"
      },
      actions: {
        finish: "완료",
        cancel: "취소",
        removeLastVertex: "마지막 점 삭제"
      },
      buttonTitles: {
        drawMarkerButton: "마커 추가",
        drawPolyButton: "다각형 그리기",
        drawLineButton: "선 그리기",
        drawCircleButton: "원 그리기",
        drawRectButton: "사각형 그리기",
        editButton: "레이어 편집",
        dragButton: "레이어 드래그",
        cutButton: "레이어 자르기",
        deleteButton: "레이어 삭제",
        drawCircleMarkerButton: "원형 마커"
      }
    });

    // 2. 주소 검색은 커스텀 Input으로 대체

    // 3. 내 위치 찾기 버튼 (커스텀 구현)
    const MyLocationButton = L.Control.extend({
      options: {
        position: "topleft"
      },
      onAdd: function (map) {
        const container = L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control"
        );
        const button = L.DomUtil.create(
          "a",
          "leaflet-control-locate",
          container
        );
        button.innerHTML = "📍";
        button.href = "#";
        button.title = "내 위치 찾기";
        button.style.fontSize = "18px";
        button.style.width = "30px";
        button.style.height = "30px";
        button.style.lineHeight = "30px";
        button.style.textAlign = "center";
        button.style.textDecoration = "none";
        button.style.display = "block";

        L.DomEvent.on(button, "click", function (e) {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);

          if (typeof navigator !== "undefined" && navigator.geolocation) {
            button.innerHTML = "⏳";
            typeof navigator !== "undefined" &&
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  map.setView([latitude, longitude], 16);

                  // 내 위치에 마커 추가
                  L.marker([latitude, longitude], { icon: customIcons.green })
                    .addTo(map)
                    .bindPopup("현재 위치")
                    .openPopup();

                  button.innerHTML = "📍";
                },
                (error) => {
                  alert("위치 정보를 가져올 수 없습니다.");
                  button.innerHTML = "📍";
                },
                {
                  enableHighAccuracy: true
                }
              );
          } else {
            alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
          }
        });

        return container;
      }
    });

    new MyLocationButton().addTo(mapInstanceRef.current);

    // 검색어가 있으면 해당 위치 검색, 없으면 현재 위치 사용
    if (searchTerm && searchTerm.trim()) {
      // 검색어로 위치 검색
      const provider = new OpenStreetMapProvider();
      provider
        .search({ query: searchTerm })
        .then((results) => {
          if (results && results.length > 0) {
            const result = results[0];
            const { y: latitude, x: longitude } = result;
            mapInstanceRef.current.setView([latitude, longitude], 15);

            // 검색된 위치에 마커 추가
            L.marker([latitude, longitude], { icon: customIcons.red })
              .addTo(mapInstanceRef.current)
              .bindPopup(`검색 결과: ${result.label}`)
              .openPopup();
          } else {
            console.log("검색 결과를 찾을 수 없습니다.");
            // 검색 실패 시 현재 위치 사용
            if (typeof navigator !== "undefined" && navigator.geolocation) {
              typeof navigator !== "undefined" &&
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    mapInstanceRef.current.setView([latitude, longitude], 15);
                  },
                  (error) => {
                    console.log(
                      "위치 정보를 가져올 수 없습니다. 기본 위치를 사용합니다.",
                      error
                    );
                  }
                );
            }
          }
        })
        .catch((error) => {
          console.log("검색 중 오류가 발생했습니다:", error);
          // 검색 실패 시 현재 위치 사용
          if (typeof navigator !== "undefined" && navigator.geolocation) {
            typeof navigator !== "undefined" &&
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  mapInstanceRef.current.setView([latitude, longitude], 15);
                },
                (error) => {
                  console.log(
                    "위치 정보를 가져올 수 없습니다. 기본 위치를 사용합니다.",
                    error
                  );
                }
              );
          }
        });
    } else {
      // 검색어가 없으면 현재 위치 사용
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        typeof navigator !== "undefined" &&
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
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, [mapType, searchTerm, customIcons]);

  return (
    <div className="relative">
      {/* 지도 */}
      <div id="v-map" className="w-100" style={{ height: "90vh" }} />

      {/* 지도 타입 선택 */}
      <div className="absolute top-px-10 w-100" style={{ zIndex: 1000 }}>
        <div className="flex gap-10 items-center justify-center w-100">
          <Input
            placeholder="주소 또는 장소 검색"
            {...inputProps}
            value={searchQuery}
            shadow="sm"
            onChange={(e) => setSearchQuery(e.target.value)}
            onEnter={() => handleSearch(searchQuery)}
            style={{ width: "300px" }}
          />
          <Select
            options={mapTypeOptions}
            onChange={(value) => setMapType(value)}
            value={mapType}
            {...selectProps}
          />
        </div>
      </div>
    </div>
  );
}
