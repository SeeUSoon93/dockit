import { Search } from "sud-icons";
import { Div, Divider, Typography } from "sud-ui";
import { useDocument } from "../../context/DocumentContext";

export default function Footer({ scale }) {
  const zoomPercentage = Math.round(scale * 100);

  const { document } = useDocument();

  const getStoryLength = (html) => {
    if (!html) return 0;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const text = doc.body.textContent || "";
    return text.replace(/\s+/g, "").length;
  };

  const currentLength = getStoryLength(document?.content || "");

  return (
    <Div className="flex justify-end pd-x-10 items-center">
      <Typography
        as="div"
        className="flex items-center gap-3"
        pretendard="SB"
        size="sm"
        color="black-8"
      >
        <Typography>{currentLength.toLocaleString()} 글자</Typography>
      </Typography>
      <Divider vertical style={{ height: "10px" }} />

      <Typography
        as="div"
        className="flex items-center gap-3"
        pretendard="SB"
        size="sm"
        color="black-8"
      >
        <Search size={14} />
        {zoomPercentage}%
      </Typography>
    </Div>
  );
}
