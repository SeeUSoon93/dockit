import { zodiacList } from "@/app/LIB/constant/zodiac";
import { Button, Card, Typography } from "sud-ui";

export default function TwelveZodiacCard({ setCurrentZodiac, currentZodiac }) {
  return (
    <Card width={"100%"} shadow="none">
      <div className="grid col-4">
        {zodiacList.map((zodiac, idx) => (
          <Button
            key={idx}
            colorType={currentZodiac === zodiac.key ? "mint" : "text"}
            onClick={() => setCurrentZodiac(zodiac.key)}
          >
            <div className="flex flex-col item-cen">
              <Typography size="3xl">{zodiac.icon}</Typography>
              <Typography size="xs" pretendard="B">
                {zodiac.name}
              </Typography>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
}
