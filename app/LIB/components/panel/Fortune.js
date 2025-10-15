import { Button, DotSpinner, toast, Typography } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { GiStarSattelites } from "react-icons/gi";
import {
  getTodayZodiac,
  getTodayZodiacFortune,
  saveTodayZodiac,
} from "../../utils/zodiacUtils";
import TwelveZodiacCard from "./ZodiacComponents/TwelveZodiacCard";
import ZodiacDetail from "./ZodiacComponents/ZodiacDetail";
import { useState, useEffect } from "react";
import { buildDailyZodiacPayload } from "../../constant/zodiac";

export default function Fortune({ dragHandleProps }) {
  const [currentZodiac, setCurrentZodiac] = useState(null);
  const [todayZodiac, setTodayZodiac] = useState(null);
  const [payload, setPayload] = useState(null);
  const [ready, setReady] = useState(false);

  const todayKST = () => {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().slice(0, 10);
  };

  const fetchTodayZodiac = async (date) => {
    setReady(false);
    const data = await getTodayZodiac(date);
    const payload = buildDailyZodiacPayload(date, 8);
    setPayload(payload);
    if (data) {
      setTodayZodiac(data);
      setReady(true);
    } else {
      const data = await getTodayZodiacFortune(payload);
      console.log(data);
      if (data) {
        setReady(true);
        setTodayZodiac(data);
        await saveTodayZodiac(date, data);
      } else {
        toast.danger("오늘의 띠 별 운세를 가져오는 데 실패했습니다.");
        setReady(false);
      }
    }
  };

  useEffect(() => {
    const date = todayKST();
    fetchTodayZodiac(date);
  }, []);

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(
      2
    )}월 ${String(d.getDate()).padStart(2, "0")}일`;
  };

  return (
    <WidgetCard
      icon={GiStarSattelites}
      title="띠별 운세"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10 overflow-y-auto max-h-px-400">
        <div className="flex flex-col item-cen jus-cen">
          <Typography size="lg" pretendard="SB">
            {todayStr()}
          </Typography>
          <Typography pretendard="B">띠별 운세</Typography>
        </div>
        {!ready ? (
          <DotSpinner
            size={25}
            text={
              <div className="flex flex-col gap-5 item-cen">
                <Typography>오늘의 띠 별 운세를 가져오는 중!</Typography>
              </div>
            }
          />
        ) : (
          <div className="flex flex-col gap-10">
            <TwelveZodiacCard
              setCurrentZodiac={setCurrentZodiac}
              currentZodiac={currentZodiac}
            />
            {currentZodiac && (
              <ZodiacDetail
                currentZodiac={currentZodiac}
                todayZodiac={todayZodiac}
                payload={payload}
              />
            )}
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
