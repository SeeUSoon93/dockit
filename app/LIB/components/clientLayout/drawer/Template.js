import { RiCloseLine } from "react-icons/ri";
import { Button, Divider, Typography } from "sud-ui";

export default function Template({ title, content, setOpen }) {
  return (
    <div className="flex flex-col gap-20">
      <div className="flex items-center justify-between">
        {/* 제목 */}
        <Typography as="h1" pretendard="B" size="xl">
          {title}
        </Typography>
        <Button
          icon={<RiCloseLine size="24" />}
          onClick={() => setOpen(false)}
          size="sm"
          colorType="text"
        />
      </div>

      {/* 내용 */}
      {content}
    </div>
  );
}
