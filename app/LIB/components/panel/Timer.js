import { Segmented, Button, Input, Typography, Card, Progress } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { TimerOutline } from "sud-icons";
import { useState, useEffect, useRef } from "react";
import { PiPauseFill, PiPlayFill, PiStopFill } from "react-icons/pi";

export default function Timer({ dragHandleProps }) {
  const [selected, setSelected] = useState("timer");
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // 밀리초
  const [inputTime, setInputTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const intervalRef = useRef(null);

  const options = [
    { value: "timer", label: "타이머" },
    { value: "stopwatch", label: "스톱워치" },
  ];

  // 시간 포맷팅 (HH:MM:SS.mmm)
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const ms = milliseconds % 1000;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  };

  // 타이머 시작/일시정지
  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    } else {
      // 타이머 모드일 때는 항상 입력된 시간으로 설정
      if (selected === "timer") {
        const totalMs =
          (inputTime.hours * 3600 +
            inputTime.minutes * 60 +
            inputTime.seconds) *
          1000;
        setTime(totalMs);
      }

      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        if (selected === "timer") {
          setTime((prev) => {
            if (prev <= 0) {
              clearInterval(intervalRef.current);
              setIsRunning(false);
              return 0;
            }
            return prev - 10; // 10ms씩 감소
          });
        } else {
          setTime((prev) => prev + 10); // 10ms씩 증가
        }
      }, 10);
    }
  };

  // 타이머 리셋
  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    if (selected === "timer") {
      const totalMs =
        (inputTime.hours * 3600 + inputTime.minutes * 60 + inputTime.seconds) *
        1000;
      setTime(totalMs);
    } else {
      setTime(0);
    }
  };

  // 컴포넌트 언마운트 시 인터벌 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 타이머/스톱워치 전환 시 리셋
  useEffect(() => {
    resetTimer();
  }, [selected]);

  const inputProps = {
    size: "sm",
    style: { width: "100%" },
    shadow: "none",
  };

  return (
    <WidgetCard
      icon={TimerOutline}
      title="타이머"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        <Segmented
          options={options}
          value={selected}
          onChange={setSelected}
          block
          size="sm"
        />

        {/* 시간 표시 */}
        <div className="flex flex-col items-center gap-10">
          {selected === "timer" && (
            <Progress
              type="dashboard"
              value={
                ((inputTime.hours * 3600 +
                  inputTime.minutes * 60 +
                  inputTime.seconds) *
                  1000 -
                  time) /
                1000
              }
              max={
                inputTime.hours * 3600 +
                inputTime.minutes * 60 +
                inputTime.seconds
              }
              size="lg"
              unit={"%"}
            />
          )}

          <Card shadow="none" width="100%">
            <div className="grid col-12 w-100">
              {formatTime(time)
                .split("")
                .map((char, index) => (
                  <div key={index} className="flex justify-center">
                    <Typography size="3xl" suite="H">
                      {char}
                    </Typography>
                  </div>
                ))}
            </div>
          </Card>

          {selected === "timer" && (
            <div className="grid col-3 gap-5">
              <Input
                {...inputProps}
                suffix="시간"
                value={inputTime.hours}
                onChange={(e) =>
                  setInputTime((prev) => ({
                    ...prev,
                    hours: parseInt(e.target.value) || 0,
                  }))
                }
              />
              <Input
                {...inputProps}
                suffix="분"
                value={inputTime.minutes}
                onChange={(e) =>
                  setInputTime((prev) => ({
                    ...prev,
                    minutes: parseInt(e.target.value) || 0,
                  }))
                }
              />
              <Input
                {...inputProps}
                suffix="초"
                value={inputTime.seconds}
                onChange={(e) =>
                  setInputTime((prev) => ({
                    ...prev,
                    seconds: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          )}
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex gap-5 justify-center">
          <Button
            onClick={toggleTimer}
            colorType={isRunning ? "primary" : "success"}
            icon={
              isRunning ? <PiPauseFill size={16} /> : <PiPlayFill size={16} />
            }
            size="sm"
          >
            {isRunning ? "일시정지" : "시작"}
          </Button>
          <Button
            onClick={resetTimer}
            colorType="text"
            icon={<PiStopFill size={16} />}
            size="sm"
          >
            리셋
          </Button>
        </div>
      </div>
    </WidgetCard>
  );
}
