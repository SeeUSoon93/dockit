import { NextResponse } from "next/server";
import { parseString } from "xml2js";

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

    fetchUrl = `${API_URL}serviceKey=${API_KEY}&pageNo=1&numOfRows=10&searchWrd=${q}`;
  }

  if (fetchUrl === "") {
    return NextResponse.json(
      { error: "선택된 값이 없습니다." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(fetchUrl);
    let data = null;
    if (selectedValue === "MOUNTAIN_INFO") {
      const xmlData = await response.text();
      // XML을 JSON으로 변환
      data = await new Promise((resolve, reject) => {
        parseString(xmlData, { explicitArray: false }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    } else {
      data = await response.json();
    }

    if (selectedValue === "MOUNTAIN_INFO") {
      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      await Promise.all(
        items.map(async (item) => {
          const mntilistno = item.mntilistno;
          const imageAPI_URL =
            "https://apis.data.go.kr/1400000/service/cultureInfoService2/mntInfoImgOpenAPI2?";
          const imageFetchUrl = `${imageAPI_URL}serviceKey=${API_KEY}&mntiListNo=${mntilistno}`;
          const imageResponse = await fetch(imageFetchUrl);
          const imageXmlData = await imageResponse.text();
          const imageData = await new Promise((resolve, reject) => {
            parseString(
              imageXmlData,
              { explicitArray: false },
              (err, result) => {
                if (err) reject(err);
                else resolve(result);
              }
            );
          });
          item.image = imageData;
        })
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
