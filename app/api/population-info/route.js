import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const srchFrYm = searchParams.get("srchFrYm");
  if (!q) {
    return NextResponse.json(
      { error: "q (admmCd) 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  const API_KEY = process.env.DATA_API_KEY;
  if (!API_KEY) {
    return NextResponse.json(
      { error: "DATA_API_KEY 환경 변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const NUM_OF_ROWS = 100;
  const AGE_API_URL =
    "https://apis.data.go.kr/1741000/admmSexdAgePpltn/selectAdmmSexdAgePpltn?";
  const HOUSEHOLD_API_URL =
    "https://apis.data.go.kr/1741000/admmPpltnHhStus/selectAdmmPpltnHhStus?";

  const EXCLUDE_SUM_KEYS = new Set([
    "ctpvNm",
    "sggNm",
    "dongNm",
    "statsYm",
    "admmCd",
    "tong",
    "ban"
  ]);
  const COPY_ONLY_KEYS = new Set([
    "ctpvNm",
    "sggNm",
    "dongNm",
    "statsYm",
    "admmCd"
  ]);

  const maleAgeKeys = [
    "male0AgeNmprCnt",
    "male10AgeNmprCnt",
    "male20AgeNmprCnt",
    "male30AgeNmprCnt",
    "male40AgeNmprCnt",
    "male50AgeNmprCnt",
    "male60AgeNmprCnt",
    "male70AgeNmprCnt",
    "male80AgeNmprCnt",
    "male90AgeNmprCnt",
    "male100AgeNmprCnt"
  ];

  const femlAgeKeys = [
    "feml0AgeNmprCnt",
    "feml10AgeNmprCnt",
    "feml20AgeNmprCnt",
    "feml30AgeNmprCnt",
    "feml40AgeNmprCnt",
    "feml50AgeNmprCnt",
    "feml60AgeNmprCnt",
    "feml70AgeNmprCnt",
    "feml80AgeNmprCnt",
    "feml90AgeNmprCnt",
    "feml100AgeNmprCnt"
  ];

  const parseItems = (data) => {
    const rawItems = data?.Response?.items?.item;
    if (!rawItems) return [];
    return Array.isArray(rawItems) ? rawItems : [rawItems];
  };

  const fetchAllItems = async (urlBuilder) => {
    let pageNo = 1;
    const allItems = [];

    while (true) {
      const requestUrl = urlBuilder(pageNo);
      const response = await fetch(requestUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`외부 API 요청 실패 (status: ${response.status})`);
      }

      const data = await response.json();
      const items = parseItems(data);
      allItems.push(...items);

      if (items.length < NUM_OF_ROWS) {
        break;
      }
      pageNo += 1;
    }

    return allItems;
  };

  const aggregateItems = (items) => {
    return items.reduce((accumulator, item = {}) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          return;
        }

        if (COPY_ONLY_KEYS.has(key)) {
          if (!accumulator[key]) {
            accumulator[key] = value;
          }
          return;
        }

        if (EXCLUDE_SUM_KEYS.has(key)) {
          return;
        }

        const numericValue = Number(value);
        if (!Number.isNaN(numericValue)) {
          accumulator[key] = (accumulator[key] ?? 0) + numericValue;
        } else if (accumulator[key] === undefined) {
          accumulator[key] = value;
        }
      });

      return accumulator;
    }, {});
  };

  const mergeAggregatedData = (primary, secondary) => {
    const merged = { ...primary };

    Object.entries(secondary).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return;
      }

      if (merged[key] === undefined) {
        merged[key] = value;
        return;
      }

      if (typeof merged[key] === "number" && typeof value === "number") {
        merged[key] += value;
      }
    });

    return merged;
  };

  const applyAgeArrayTransform = (data) => {
    if (!data) {
      return data;
    }

    const hasAgeData =
      maleAgeKeys.some((key) => data[key] !== undefined) ||
      femlAgeKeys.some((key) => data[key] !== undefined);

    if (!hasAgeData) {
      return data;
    }

    const transformed = { ...data };

    const maleAgeArray = maleAgeKeys.map((key) => {
      const value = Number(transformed[key] ?? 0);
      delete transformed[key];
      return Number.isNaN(value) ? 0 : value;
    });

    const femlAgeArray = femlAgeKeys.map((key) => {
      const value = Number(transformed[key] ?? 0);
      delete transformed[key];
      return Number.isNaN(value) ? 0 : value;
    });

    return {
      ...transformed,
      maleAgeArray,
      femlAgeArray
    };
  };

  try {
    const fetchAggregatedData = async (urlBuilder) => {
      const items = await fetchAllItems(urlBuilder);
      if (!items.length) {
        return {};
      }
      return aggregateItems(items);
    };

    let aggregatedAge = null;
    let aggregatedHousehold = null;

    try {
      aggregatedAge = await fetchAggregatedData(
        (pageNo) =>
          `${AGE_API_URL}serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=${NUM_OF_ROWS}&admmCd=${q}&srchFrYm=${srchFrYm}&srchToYm=${srchFrYm}&lv=4&type=json`
      );
    } catch (error) {
      console.error("연령별 인구 API 호출 실패:", error);
    }

    try {
      aggregatedHousehold = await fetchAggregatedData(
        (pageNo) =>
          `${HOUSEHOLD_API_URL}serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=${NUM_OF_ROWS}&admmCd=${q}&srchFrYm=${srchFrYm}&srchToYm=${srchFrYm}&lv=4&type=json`
      );
    } catch (error) {
      console.error("세대별 인구 API 호출 실패:", error);
    }

    if (aggregatedAge === null && aggregatedHousehold === null) {
      throw new Error("연령별·세대별 인구 API 호출이 모두 실패했습니다.");
    }

    if (aggregatedAge === null) {
      return NextResponse.json(applyAgeArrayTransform(aggregatedHousehold));
    }

    if (aggregatedHousehold === null) {
      return NextResponse.json(applyAgeArrayTransform(aggregatedAge));
    }

    const fullData = mergeAggregatedData(aggregatedAge, aggregatedHousehold);

    return NextResponse.json(applyAgeArrayTransform(fullData));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
