import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json(
      { error: "검색어가 필요합니다." },
      { status: 400 }
    );
  }

  const API_URL = "https://opendict.korean.go.kr/api/search";
  const API_KEY = process.env.DIC_API_KEY;

  const req_type = "json";
  const num = 100;
  const part = "word";
  const sort = "dict";

  try {
    const apiRes = await fetch(
      `${API_URL}?key=${API_KEY}&q=${q}&req_type=${req_type}&num=${num}&part=${part}&sort=${sort}`
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
