import { Button, Calendar, Typography } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { useState, useEffect } from "react";
import { CalendarOutline, TriangleLeft, TriangleRight } from "sud-icons";
import dayjs from "dayjs";
import { locale_ko } from "../../constant/widget_constant";
const API_SUB_URL = process.env.NEXT_PUBLIC_API_SUB_URL;

export default function CalendarWidget({ dragHandleProps }) {
  const [events, setEvents] = useState([]);
  const [today, setToday] = useState(new Date());
  const [date, setDate] = useState(dayjs(today));
  const [holidays, setHolidays] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // 한국 휴일 가져오기
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch(
          `${API_SUB_URL}/check/holidays/${currentYear}/18`
        );
        const data = await res.json();
        console.log(data);
        const formattedHolidays = data.holidays.map(
          (date) =>
            `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
        );

        setHolidays(formattedHolidays);
      } catch (error) {
        console.error("휴일 데이터 가져오기 실패:", error);
        setHolidays([]);
      }
    };

    fetchHolidays();
  }, [currentYear]); // 연도만 의존성으로 설정
  const [showYearMonthSelector, setShowYearMonthSelector] = useState(false);

  const handlePrev = () => {
    if (!date) return;

    const newDate = date.subtract(1, "month").startOf("month");
    setDate(newDate);
    setToday(newDate.toDate());

    // 연도가 바뀌면 휴일 업데이트
    const newYear = newDate.year();
    if (newYear !== currentYear) {
      setCurrentYear(newYear);
    }
  };

  const handleNext = () => {
    if (!date) return;

    const newDate = date.add(1, "month").startOf("month");
    setDate(newDate);
    setToday(newDate.toDate());

    // 연도가 바뀌면 휴일 업데이트
    const newYear = newDate.year();
    if (newYear !== currentYear) {
      setCurrentYear(newYear);
    }
  };

  const handleDateClick = () => {
    setShowYearMonthSelector(!showYearMonthSelector);
  };

  const yearText = locale_ko.yearFormat(date);
  const monthNumber = date.month() + 1;

  return (
    <WidgetCard
      icon={CalendarOutline}
      title="달력"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        <Calendar
          value={date}
          locale="ko"
          headerRender={
            <div className="flex jus-cen item-cen w-100">
              <Button
                onClick={handlePrev}
                size="sm"
                colorType="text"
                icon={<TriangleLeft size={15} />}
              />

              <Typography
                as="span"
                gmarket="Medium"
                onClick={handleDateClick}
                style={{ cursor: "pointer" }}
              >
                {yearText}{" "}
                {monthNumber < 10 ? `0${monthNumber}월` : `${monthNumber}월`}
              </Typography>
              <Button
                onClick={handleNext}
                size="sm"
                colorType="text"
                icon={<TriangleRight size={15} />}
              />
            </div>
          }
          holidays={holidays}
          holidaysStyle={{
            background: "cool-gray-2",
            color: "red-7"
          }}
        />
      </div>
    </WidgetCard>
  );
}
