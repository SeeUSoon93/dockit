import { inputProps } from "@/app/LIB/constant/uiProps";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Collapse,
  Div,
  Divider,
  DotSpinner,
  Image,
  Input,
  Pagination,
  Select,
  Table,
  Typography
} from "sud-ui";

export default function COUNTRY_INFO() {
  const [mainData, setMainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // 국가 목록 로드
  useEffect(() => {
    const loadCountryList = async () => {
      const res = await fetch("/country/cnt_mapping.json");
      const data = await res.json();
      const options = Object.keys(data).map((key) => ({
        label: data[key],
        value: key
      }));
      setCountryList(options);
    };
    loadCountryList();
  }, []);

  const handleSearch = async () => {
    if (!selectedCountry) return;
    setLoading(true);
    setMainData(null);
    try {
      const res = await fetch(`/api/country-info?code=${selectedCountry}`);
      if (!res.ok) {
        throw new Error(`API 오류: ${res.status}`);
      }
      const data = await res.json();
      setMainData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      handleSearch();
    }
  }, [selectedCountry]);

  // 숫자 3자리마다 쉼표 추가하는 함수
  const formatNumber = (number) => {
    if (!number) return "-";
    if (number === 0) return "0";
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="w-100 flex flex-col gap-5">
      <div className="flex jus-bet">
        <Select
          {...inputProps}
          value={selectedCountry}
          onChange={(value) => setSelectedCountry(value)}
          placeholder={"검색할 국가를 선택하세요"}
          options={countryList}
          searchable
        />
      </div>
      {loading ? (
        <DotSpinner text="검색 중입니다..." />
      ) : mainData ? (
        <>
          <div className="flex flex-col gap-10">
            <Card
              width="100%"
              className="flex flex-col gap-10"
              shadow="none"
              background={"cool-gray-1"}
            >
              <div className="flex flex-col gap-5">
                {/* 제목 */}
                <div className="flex flex-col item-cen jus-cen">
                  <Typography pretendard="SB" size="lg">
                    {mainData.flag[0].country_nm}
                  </Typography>
                  <Typography size="xs">
                    {mainData.flag[0].country_eng_nm}
                  </Typography>
                </div>
                {/* 썸네일 */}
                <Image
                  src={mainData.flag[0].download_url}
                  width="100%"
                  shadow="sm"
                />
                <Divider content="일반사항" />
                {mainData.general[0] && (
                  <Table
                    columns={[
                      { key: "key", title: "항목", align: "center", col: 1 },
                      { key: "content", title: "내용", align: "left", col: 4 }
                    ]}
                    dataSource={[
                      { key: "수도", content: mainData.general[0].capital },
                      {
                        key: "인구",
                        content: `${formatNumber(
                          mainData.general[0].population
                        )}명 ${mainData.general[0].population_desc}`
                      },
                      {
                        key: "면적",
                        content: `${formatNumber(
                          mainData.general[0].area
                        )}km² ${mainData.general[0].area_desc}`
                      },
                      { key: "언어", content: mainData.general[0].lang },
                      { key: "종교", content: mainData.general[0].religion },
                      { key: "민족", content: mainData.general[0].ethnic },
                      { key: "기후", content: mainData.general[0].climate },
                      { key: "건국", content: mainData.general[0].establish }
                    ]}
                    size="sm"
                  />
                )}
                <Divider content="경제 현황" />
                {mainData.economic[0] && (
                  <Table
                    columns={[
                      { key: "key", title: "항목", align: "center", col: 1 },
                      { key: "content", title: "내용", align: "left", col: 2 }
                    ]}
                    dataSource={[
                      {
                        key: "GDP",
                        content: `${formatNumber(mainData.economic[0].gdp)} ${
                          mainData.economic[0].gdp_desc
                        } (USD)`
                      },
                      {
                        key: "1인당 GDP",
                        content: `${formatNumber(
                          mainData.economic[0].gdp_per_capita
                        )} USD`
                      },
                      {
                        key: "경제성장률",
                        content: `${
                          mainData.economic[0].gdp_growth_rate ?? ""
                        }% ${mainData.economic[0].gdp_growth_rate_desc ?? ""}`
                      },
                      {
                        key: "물가상승률",
                        content: `${
                          mainData.economic[0].inflation_rate ?? ""
                        }% ${mainData.economic[0].gdp_growth_rate_desc ?? ""}`
                      },
                      {
                        key: "실업률",
                        content: `${
                          mainData.economic[0].unemployment_rate ?? ""
                        }% ${mainData.economic[0].unemployment_desc ?? ""}`
                      },
                      {
                        key: "화폐 단위",
                        content: mainData.economic[0].currency_unit
                      },
                      {
                        key: "주요 자원",
                        content: mainData.economic[0].main_resource
                      },
                      {
                        key: "주요 산업",
                        content: mainData.economic[0].main_industry
                      },
                      {
                        key: "수출액",
                        content: `${formatNumber(
                          mainData.economic[0].export_amount
                        )} USD`
                      },
                      {
                        key: "수입액",
                        content: `${formatNumber(
                          mainData.economic[0].import_amount
                        )} USD`
                      }
                    ]}
                  />
                )}
                <Divider content="치안 환경" />
                {mainData.security[0] && (
                  <Table
                    columns={[
                      { key: "key", title: "항목", align: "center", col: 1 },
                      { key: "content", title: "내용", align: "left", col: 1 }
                    ]}
                    dataSource={[
                      {
                        key: "현재 여행경보",
                        content: mainData.security[0].current_travel_alarm
                      },
                      {
                        key: "자살 사망률",
                        content: `${
                          mainData.security[0].suicide_death_rate ?? "-"
                        }% (${
                          mainData.security[0].suicide_death_rate_year ?? ""
                        })`
                      }
                    ]}
                  />
                )}
                <Divider content="의료 환경" />
                {mainData.medical[0] && (
                  <Table
                    columns={[
                      { key: "key", title: "항목", align: "center", col: 3 },
                      { key: "content", title: "내용", align: "left", col: 1 }
                    ]}
                    dataSource={[
                      {
                        key: "깨끗한 음용수 사용 비율",
                        content: `${
                          mainData.security[0].clean_water_use_rate ?? "-"
                        }% (${
                          mainData.security[0].clean_water_use_rate_year ?? ""
                        })`
                      },
                      {
                        key: "결핵 10만명 당 발병률",
                        content: `${
                          mainData.security[0]
                            .tuber_pr_hndrd_thsnd_ppl_outbreak_rate ?? "-"
                        }% (${
                          mainData.security[0]
                            .tuber_pr_hndrd_thsnd_ppl_outbreak_rate_year ?? ""
                        })`
                      }
                    ]}
                  />
                )}
                <Divider content={`우리나라와의 관계`} />
                {mainData.relation[0] && (
                  <Table
                    columns={[
                      { key: "key", title: "항목", align: "center", col: 1 },
                      { key: "content", title: "내용", align: "left", col: 3 }
                    ]}
                    dataSource={[
                      {
                        key: "외교 관계",
                        content: mainData.relation[0].diplomatic_relations
                      },
                      {
                        key: "공관 현황",
                        content: mainData.relation[0].mission_status
                      },
                      {
                        key: "투자 현황",
                        content: mainData.relation[0].investment_status
                      },
                      {
                        key: "교민 현황",
                        content: mainData.relation[0].oks_status
                      },
                      {
                        key: "ODA현황",
                        content: mainData.relation[0].oda_status
                      },
                      {
                        key: "수출액",
                        content: formatNumber(
                          mainData.relation[0].export_amount
                        )
                      },
                      {
                        key: "수입액",
                        content: formatNumber(
                          mainData.relation[0].import_amount
                        )
                      }
                    ]}
                    size="sm"
                  />
                )}
              </div>
            </Card>
          </div>
        </>
      ) : (
        !loading &&
        !error && (
          <div className="flex jus-cen item-cen w-100">
            <Typography color={"cool-gray-7"}>검색결과가 없습니다.</Typography>
          </div>
        )
      )}
    </div>
  );
}
