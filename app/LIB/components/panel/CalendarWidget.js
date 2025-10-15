import {
  Button,
  Calendar,
  DatePicker,
  Divider,
  Input,
  Modal,
  Tag,
  toast,
  Typography,
} from "sud-ui";
import WidgetCard from "./WidgetCard";
import { useState, useEffect } from "react";
import { CalendarOutline, Plus, TriangleLeft, TriangleRight } from "sud-icons";
import dayjs from "dayjs";
import { locale_ko } from "../../constant/widget_constant";
import { createData, deleteData, fetchDataList } from "../../utils/dataUtils";
import { API_HKI_URL } from "../../config/config";

export default function CalendarWidget({ dragHandleProps }) {
  const [events, setEvents] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [today, setToday] = useState(new Date());
  const [date, setDate] = useState(dayjs(today));
  const [holidays, setHolidays] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [openAddModal, setOpenAddModal] = useState(false);
  const [itemContent, setItemContent] = useState("");
  const [itemDate, setItemDate] = useState(dayjs(today));

  // 한국 휴일 가져오기
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch(
          `${API_HKI_URL}/check/holidays/${currentYear}/18`
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

  const fetchEvents = async () => {
    const res = await fetchDataList("calendar");
    setEvents(res.content);
  };

  const handleAddItem = async () => {
    if (itemContent === "" || itemDate === "") return;

    await createData("calendar", null, {
      content: itemContent,
      date: dayjs(itemDate).format("YYYY-MM-DD"),
    });
    setOpenAddModal(false);
    setItemContent("");
    setItemDate(dayjs(today));
    toast.success("일정이 추가되었습니다.");

    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length === 0) return;

    setTodayEvents(
      events.filter((event) => dayjs(event.date).isSame(dayjs(date), "day"))
    );
  }, [events, date]);

  const handleDeleteEvent = async (id) => {
    await deleteData("calendar", id);
    fetchEvents();
  };

  return (
    <WidgetCard
      icon={CalendarOutline}
      title="달력"
      dragHandleProps={dragHandleProps}
      titleBtn={
        <Button
          icon={<Plus size={13} />}
          colorType="text"
          size="sm"
          onClick={() => setOpenAddModal(true)}
        />
      }
    >
      <div className="w-100 flex flex-col gap-10">
        <Calendar
          value={date}
          locale="ko"
          items={events}
          onChange={(value) => setDate(dayjs(value))}
          size="miniView"
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
            color: "red-7",
          }}
        />
        <Divider />
        <div className="flex flex-col gap-10 item-center">
          <Typography gmarket="Medium" className="text-center">
            {date.format("YYYY/MM/DD")} 일정
          </Typography>
          <div className="flex flex-wrap gap-5 overflow-y-auto max-h-[80px]">
            {todayEvents.map((event, index) => (
              <Tag
                key={event._id}
                colorType={index % 2 === 0 ? "mint" : "blue"}
                closeable
                onClose={() => handleDeleteEvent(event._id)}
              >
                <Typography size="sm">● {event.content}</Typography>
              </Tag>
            ))}
          </div>
        </div>
      </div>

      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <div className="flex flex-col gap-10">
          <Typography pretendard="SB" size="lg">
            일정추가
          </Typography>
          <Input
            placeholder="내용"
            shadow="none"
            size="sm"
            style={{ width: "100%" }}
            value={itemContent}
            onChange={(e) => setItemContent(e.target.value)}
          />
          <DatePicker
            placeholder="날짜"
            shadow="none"
            size="sm"
            style={{ width: "100%" }}
            locale="ko"
            value={itemDate}
            onChange={(value) => setItemDate(value)}
          />
          <div className="flex justify-end gap-10">
            <Button
              onClick={() => setOpenAddModal(false)}
              colorType="danger"
              size="sm"
            >
              취소
            </Button>
            <Button
              onClick={handleAddItem}
              disabled={itemContent === "" || itemDate === ""}
              colorType="primary"
              size="sm"
            >
              추가
            </Button>
          </div>
        </div>
      </Modal>
    </WidgetCard>
  );
}
