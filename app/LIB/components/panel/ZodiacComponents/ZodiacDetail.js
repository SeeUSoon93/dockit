import { Card, Divider, Progress, Typography } from "sud-ui";
import ZodiacYearDetail from "./ZodiacYearDetail";
import { zodiacList } from "@/app/LIB/constant/zodiac";

export default function ZodiacDetail({ currentZodiac, todayZodiac, payload }) {
  const detail = todayZodiac.zodiac.signs[currentZodiac];
  const currentAnimal = zodiacList.find((z) => z.key === currentZodiac);
  const payloadDetail = payload.signs[currentZodiac];

  const LEVELS = [
    { min: 80, color: "green" },
    { min: 60, color: "orange" },
    { min: 40, color: "volcano" },
    { min: 20, color: "red" },
    { min: -Infinity, color: "neutral" },
  ];

  const getColorByScore = (score) => {
    return LEVELS.find((lv) => score >= lv.min)?.color || "neutral";
  };

  const mainScore = {
    key: "overall",
    label: "총운",
    type: "dashboard",
    width: "100",
  };
  const subScores = [
    { key: "work", label: "일", icon: "💼" },
    { key: "love", label: "사랑", icon: "💞" },
    { key: "money", label: "금전", icon: "🪙" },
    { key: "health", label: "건강", icon: "💪🏻" },
  ];

  return (
    <Card width={"100%"} shadow="none">
      <div className="flex gap-20 flex-col">
        <div className="flex gap-5 item-cen">
          <Typography pretendard="B">
            {currentAnimal.icon} 오늘의 {currentAnimal.name}띠 운세
          </Typography>
        </div>

        {/* 총운 표시 */}
        <div className={`flex flex-col item-cen gap-10`}>
          <Typography pretendard="B">{mainScore.label}</Typography>
          <Progress
            value={payloadDetail.summary.scores[mainScore.key]}
            type={mainScore.type}
            unit="점"
            colorType={getColorByScore(
              payloadDetail.summary.scores[mainScore.key]
            )}
          />
        </div>

        {/* 운세 내용 */}
        <div className="flex flex-col gap-10">
          <div>
            <Typography>{detail.summary.text}</Typography>
          </div>
        </div>

        {/* 나머지 운 표시 */}
        {subScores.map((item) => (
          <div key={item.key} className="flex item-cen gap-10">
            <div className="w-20">
              <Typography pretendard="B" size="sm">
                {item.icon} {item.label}
              </Typography>
            </div>
            <div className="w-80">
              <Progress
                value={payloadDetail.summary.scores[item.key]}
                type="bar"
                unit="점"
                colorType={getColorByScore(
                  payloadDetail.summary.scores[item.key]
                )}
                valuePosition="outside-right"
              />
            </div>
          </div>
        ))}
        <Divider content="연생 별 운세" />
        <ZodiacYearDetail detail={detail} payloadDetail={payloadDetail} />
      </div>
    </Card>
  );
}
