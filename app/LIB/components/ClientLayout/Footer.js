import { Search } from "sud-icons";
import { Div, Typography } from "sud-ui";

export default function Footer({ scale }) {
  const zoomPercentage = Math.round(scale * 100);
  return (
    <Div className="flex justify-end pd-x-10">
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
