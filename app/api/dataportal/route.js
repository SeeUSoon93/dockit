import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const selectedValue = searchParams.get("select_value");
  const subValue = searchParams.get("sub_value");
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
    if (q) {
      fetchUrl = `${API_URL}serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=10&type=json&Prduct=${q}`;
      console.log("검색 어검색 중");
    } else {
      fetchUrl = `${API_URL}serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=10&type=json`;
    }
  }

  try {
    const response = await fetch(fetchUrl);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
