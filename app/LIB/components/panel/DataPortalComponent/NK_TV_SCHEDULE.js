import { inputProps } from "@/app/LIB/constant/uiProps";
import { useEffect, useState } from "react";
import { Card, DatePicker, DotSpinner, Table, Typography } from "sud-ui";

export default function NK_TV_SCHEDULE() {
  const [mainData, setMainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setMainData(null);
    try {
      const res = await fetch(
        `/api/dataportal?select_value=NK_TV_SCHEDULE&sub_value=${selectedDate}`
      );
      if (!res.ok) {
        throw new Error(`API 오류: ${res.status}`);
      }
      const data = await res.json();
      setMainData(data.items);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const formatDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    const formattedDate = dateString.split("-").join("");
    setSelectedDate(formattedDate);
  };
  useEffect(() => {
    formatDate(date);
  }, [date]);

  useEffect(() => {
    console.log(selectedDate);
    handleSearch();
  }, [selectedDate]);

  // 시간 포맷

  const formatTime = (time) => {
    // time은 1108 형식임
    // 1. AM or PM 판단
    const amPm = time < 1200 ? "AM" : "PM";
    const hours = time.slice(0, 2);
    const formattedHours = hours < 12 ? hours : hours - 12;
    const finalHours =
      formattedHours < 10 ? `0${formattedHours}` : formattedHours;
    const minutes = time.slice(2, 4);

    return `${amPm} ${finalHours}:${minutes}`;
  };

  return (
    <div className="w-100 flex flex-col gap-5">
      <div className="flex jus-bet">
        <DatePicker
          {...inputProps}
          value={date}
          onChange={(value) => setDate(value)}
          locale="ko"
          placeholder={"검색할 날짜를 선택하세요"}
          style={{ width: "100%" }}
          inputProps={{ style: { width: "100%" } }}
          popConfirmProps={{ style: { width: "100%" } }}
        />
      </div>
      {loading ? (
        <DotSpinner text="검색 중입니다..." />
      ) : mainData && mainData.length > 0 ? (
        <>
          <div className="flex flex-col gap-10">
            <Table
              columns={[
                { key: "time", title: "방송 시간", align: "center", col: 2 },
                {
                  key: "program",
                  title: "방송 프로그램",
                  align: "left",
                  col: 5,
                },
              ]}
              dataSource={mainData.map((item, idx) => ({
                time: formatTime(item.frmtn_time),
                program: item.sj,
              }))}
            />
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
