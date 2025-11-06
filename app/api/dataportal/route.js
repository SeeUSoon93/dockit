import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const selectedValue = searchParams.get("select_value");
  const pageNo = searchParams.get("pageNo");
  const q = searchParams.get("q");
  const subValue = searchParams.get("sub_value");

  const API_KEY = process.env.DATA_API_KEY;

  if (!selectedValue) {
    return NextResponse.json(
      { error: "선택된 값이 없습니다." },
      { status: 400 }
    );
  }
  let fetchUrl = "";

  if (selectedValue === "HEALTH_FOOD_INFO") {
    const API_URL =
      "https://apis.data.go.kr/1471000/HtfsInfoService03/getHtfsItem01?";
    fetchUrl = `${API_URL}serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=10&type=json&Prduct=${q}`;
  }
  if (selectedValue === "TOUR_PHOTO") {
    const encodedQ = encodeURIComponent(q);
    const API_URL =
      "	https://apis.data.go.kr/B551011/PhotoGalleryService1/gallerySearchList1?";
    fetchUrl = `${API_URL}serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=10&_type=json&keyword=${encodedQ}&MobileOS=ETC&MobileApp=Dockit&_type=json&arrange=A`;
  }
  if (selectedValue === "HACCP_PRODUCT_INFO") {
    const API_URL =
      "https://apis.data.go.kr/B553748/CertImgListServiceV3/getCertImgListServiceV3?";
    fetchUrl = `${API_URL}serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=10&returnType=json&prdlstNm=${q}`;
  }
  if (selectedValue === "MOUNTAIN_INFO") {
    const API_URL =
      "https://apis.data.go.kr/1400000/service/cultureInfoService2/mntInfoOpenAPI2?";
    fetchUrl = `${API_URL}serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=10&searchWrd=${q}`;
  }
  if (selectedValue === "POPULATION_INFO") {
    // 오늘 날짜를 구하고 한달 전 날짜로 변경 . 202510 형식
    const today = new Date();
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));
    const oneMonthAgoString = oneMonthAgo
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
    const API_URL =
      "https://apis.data.go.kr/1741000/admmPpltnHhStus/selectAdmmPpltnHhStus?";
    fetchUrl = `${API_URL}serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=1&admmCd=${subValue.admmCd}&srchFrYm=${oneMonthAgoString}&srchToYm=${oneMonthAgoString}&lv=3&type=json`;
  }
  if (selectedValue === "COUNTRY_INFO") {
    const API_URL =
      "https://apis.data.go.kr/1262000/CountryBasicService/getCountryBasicList?";
    fetchUrl = `${API_URL}serviceKey=${API_KEY}&pageNo=1&numOfRows=100&countryName=${q}`;
  }
  // if (selectedValue === "EVENT_INFO") {
  //   const API_URL =
  //     "http://apis.data.go.kr/B551011/KorService2/searchFestival2?";
  //   fetchUrl = `${API_URL}serviceKey=${API_KEY}&pageNo=1&numOfRows=100&countryName=${q}`;
  // }
  if (fetchUrl === "") {
    return NextResponse.json(
      { error: "선택된 값이 없습니다." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(fetchUrl);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
