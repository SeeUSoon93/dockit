import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const page = searchParams.get("page");

  if (!q) {
    return NextResponse.json(
      { error: "검색어가 필요합니다." },
      { status: 400 }
    );
  }

  const API_URL = "https://api.unsplash.com/search/photos?query=";
  const API_KEY = process.env.UNSPLASH_ACCESS_KEY;

  try {
    const apiRes = await fetch(
      `${API_URL}${q}&per_page=10&page=${page}&client_id=${API_KEY}`,
      {
        headers: {
          Authorization: `Client-ID ${API_KEY}`,
        },
      }
    );

    if (!apiRes.ok) {
      return NextResponse.json(
        { error: `API 서버가 ${apiRes.status} 코드로 응답했습니다.` },
        { status: apiRes.status }
      );
    }

    const data = await apiRes.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
