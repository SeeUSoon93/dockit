import { Card, Typography } from "sud-ui";

export default function WidgetCard({
  icon,
  title,
  children,
  dragHandleProps,
  titleBtn
}) {
  const Icon = icon;
  return (
    <Card
      className="hover-shadow-7"
      size="sm"
      width={"100%"}
      border={false}
      shadow="md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-10"
      >
        <div
          className="flex jus-bet w-100 item-cen cursor-move"
          {...dragHandleProps}
        >
          <div className="flex gap-5 item-cen">
            <Icon size={20} />
            <Typography>{title}</Typography>
          </div>
          {titleBtn && titleBtn}
        </div>
        <div>{children}</div>
      </div>
    </Card>
  );
}
