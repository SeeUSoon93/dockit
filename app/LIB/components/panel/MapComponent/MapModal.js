"use client";

import { Card, Modal, Select } from "sud-ui";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

export default function MapModal() {
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const routingControlRef = useRef(null);

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

    // 2. 주소 검색 (GeoSearch)
    const searchControl = new GeoSearchControl({
      provider: new OpenStreetMapProvider(),
      style: "bar",
      showMarker: true,
      showPopup: true,
      marker: {
        icon: new L.Icon.Default(),
        draggable: false
      },
      popupFormat: ({ query, result }) => result.label,
      maxMarkers: 1,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: "주소 또는 장소 검색",
      keepResult: true
    });
    mapInstanceRef.current.addControl(searchControl);

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

          if (navigator.geolocation) {
            button.innerHTML = "⏳";
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 16);

                // 내 위치에 마커 추가
                L.marker([latitude, longitude])
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

    // 4. 길찾기 버튼 (커스텀 컨트롤)
    const RoutingButton = L.Control.extend({
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
          "leaflet-control-routing",
          container
        );
        button.innerHTML = "🚗";
        button.href = "#";
        button.title = "길찾기";
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

          if (routingControlRef.current) {
            // 길찾기 제거
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
            button.style.backgroundColor = "";
          } else {
            // 길찾기 추가
            routingControlRef.current = L.Routing.control({
              waypoints: [],
              routeWhileDragging: true,
              showAlternatives: true,
              addWaypoints: true,
              draggableWaypoints: true,
              fitSelectedRoutes: true,
              show: true,
              lineOptions: {
                styles: [{ color: "#6366f1", weight: 4, opacity: 0.7 }]
              },
              createMarker: function (i, waypoint, n) {
                const marker = L.marker(waypoint.latLng, {
                  draggable: true,
                  icon: L.icon({
                    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${
                      i === 0 ? "green" : i === n - 1 ? "red" : "blue"
                    }.png`,
                    shadowUrl:
                      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })
                });
                return marker;
              }
            }).addTo(map);

            button.style.backgroundColor = "#6366f1";
            button.style.color = "white";

            // 지도 클릭으로 경유지 추가
            let clickCount = 0;
            const onMapClick = (e) => {
              const waypoints = routingControlRef.current.getWaypoints();
              if (waypoints.length < 10) {
                routingControlRef.current.spliceWaypoints(
                  waypoints.length,
                  1,
                  e.latlng
                );
              }
            };

            map.on("click", onMapClick);
          }
        });

        return container;
      }
    });

    new RoutingButton().addTo(mapInstanceRef.current);

    // 사용자 현재 위치 가져오기 (초기 로드)
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
        tileLayerRef.current = null;
        routingControlRef.current = null;
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
