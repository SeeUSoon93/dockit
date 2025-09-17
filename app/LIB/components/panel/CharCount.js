import { GoNumber } from "react-icons/go";
import { Progress, Typography } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { useDocument } from "../../context/DocumentContext";

export default function CharCount({ dragHandleProps }) {
  const { document } = useDocument();

  const getStoryLength = (html) => {
    if (!html) return 0;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const text = doc.body.textContent || "";
    return text.replace(/\s+/g, "").length;
  };

  const currentLength = getStoryLength(document?.content || "");
  const maxLength = 10000;

  return (
    <WidgetCard
      icon={GoNumber}
      title="글자 수"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        <div className="flex jus-bet">
          <Typography>
            {currentLength.toLocaleString()} / {maxLength.toLocaleString()}자
          </Typography>
          <Typography size="lg" gmarket={"Medium"}>
            {Math.floor((currentLength / maxLength) * 100)}%
          </Typography>
        </div>
        <Progress
          value={currentLength}
          max={maxLength}
          color="mint"
          size="sm"
          showText={false}
        />
      </div>
    </WidgetCard>
  );
}
