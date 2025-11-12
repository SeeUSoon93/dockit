import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const API_KEY = process.env.DATA_API_KEY;
  let fullData = {}; // 전체 데이터

  const parameter = `serviceKey=${API_KEY}&returnType=json&numOdRows=1&cond[country_iso_alp2::EQ]=${code}&pageNo=1`;

  // 국기 이미지 조회
  const flag_url = `https://apis.data.go.kr/1262000/CountryFlagService2/getCountryFlagList2?${parameter}`;
  //   일반사항
  const general_url = `https://apis.data.go.kr/1262000/OverviewGnrlInfoService/getOverviewGnrlInfoList?${parameter}`;

  // 우리나라와의 관계
  const relation_url = `https://apis.data.go.kr/1262000/OverviewKorRelationService/getOverviewKorRelationList?${parameter}`;

  // 경제현황
  const economic_url = `https://apis.data.go.kr/1262000/OverviewEconomicService/OverviewEconomicList?${parameter}`;

  // 치안환경
  const security_url = `https://apis.data.go.kr/1262000/SecurityEnvironmentService/getSecurityEnvironmentList?${parameter}`;

  // 의료환경
  const medical_url = `https://apis.data.go.kr/1262000/MedicalEnvironmentService/getMedicalEnvironmentList?${parameter}`;

  try {
    const flag_response = await fetch(flag_url);
    const flag_data = await flag_response.json();
    const general_response = await fetch(general_url);
    const general_data = await general_response.json();
    const relation_response = await fetch(relation_url);
    const relation_data = await relation_response.json();
    const economic_response = await fetch(economic_url);
    const economic_data = await economic_response.json();
    const security_response = await fetch(security_url);
    const security_data = await security_response.json();
    const medical_response = await fetch(medical_url);
    const medical_data = await medical_response.json();
    fullData = {
      flag: flag_data.response.body.items.item,
      general: general_data.response.body.items.item,
      relation: relation_data.response.body.items.item,
      economic: economic_data.response.body.items.item,
      security: security_data.response.body.items.item,
      medical: medical_data.response.body.items.item,
    };
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(fullData);
}
