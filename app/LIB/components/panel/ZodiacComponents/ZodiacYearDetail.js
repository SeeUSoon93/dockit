import { Card, Progress, Typography } from "sud-ui";

const SCORE_ITEMS = [
  { key: "work", label: "일", icon: "💼" },
  { key: "love", label: "사랑", icon: "💞" },
  { key: "money", label: "금전", icon: "🪙" },
  { key: "health", label: "건강", icon: "💪🏻" },
  { key: "overall", label: "총운", icon: "🪭" },
];

export default function ZodiacYearDetail({ detail, payloadDetail }) {
  const cohortList = detail.cohorts.sort((a, b) => a.year - b.year);
  const ResultSubCardProps = {
    width: "100%",
    shadow: "none",
    border: false,
  };
  const ScoreProgress = ({ scores }) => {
    return SCORE_ITEMS.map(({ key, label, icon }) => (
      <div className="flex w-100 gap-10" key={key}>
        <div className="w-30">
          <Typography pretendard="B" size="sm">
            {icon} {label}
          </Typography>
        </div>
        <div className="w-70">
          <Progress
            value={scores[key]}
            type="bar"
            unit="점"
            valuePosition="outside-right"
            colorType="mint"
          />
        </div>
      </div>
    ));
  };

  return (
    <div className="flex gap-15 flex-col">
      <div className="flex flex-col gap-15">
        {cohortList.map((c, idx) => {
          const scores = payloadDetail.cohorts.find(
            (data) => data.year === c.year
          ).scores;

          return (
            <Card {...ResultSubCardProps} background="cool-gray-1" key={idx}>
              <div className="flex flex-col gap-10">
                <div>
                  <Typography
                    pretendard="B"
                    style={{
                      paddingLeft: "1.2em",
                      textIndent: "-1.6em",
                      display: "block",
                    }}
                  >
                    ▪️ {c.year}년생
                  </Typography>
                  <Typography
                    key={idx}
                    style={{
                      paddingLeft: "1.2em",
                      display: "block",
                    }}
                  >
                    {c.text}
                  </Typography>
                </div>
                <div
                  className="grid col-1 gap-5"
                  style={{
                    paddingLeft: "1.2em",
                  }}
                >
                  <ScoreProgress scores={scores} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
