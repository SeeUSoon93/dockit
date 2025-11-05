import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const selectedValue = searchParams.get("select_value");
  const pageNo = searchParams.get("pageNo");
  const q = searchParams.get("q");

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
  if (selectedValue === "COMPANY_INFO") {
    const API_URL =
      "https://apis.data.go.kr/1160100/service/GetCorpBasicInfoService_V2/getCorpOutline_V2?";
    fetchUrl = `${API_URL}serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=10&resultType=json&corpNm=${q}`;
  }
  if (selectedValue === "KOREA_TOUR_PHOTO") {
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

  try {
    const response = await fetch(fetchUrl);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
