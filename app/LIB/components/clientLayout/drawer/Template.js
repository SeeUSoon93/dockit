import { Divider, Typography } from "sud-ui";

export default function Template({ title, content }) {
  return (
    <div className="flex flex-col gap-20 ">
      {/* 제목 */}
      <Typography as="h1" pretendard="B" size="xl">
        {title}
      </Typography>
      <Divider style={{ margin: 0 }} />
      {/* 내용 */}
      {content}
    </div>
  );
}
