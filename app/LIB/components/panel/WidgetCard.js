import { Card, Div, Typography } from "sud-ui";

export default function WidgetCard({
  icon,
  title,
  children,
  dragHandleProps,
  titleBtn,
}) {
  const Icon = icon;
  return (
    <Card
      className="hover-shadow-6"
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
          <Div className="flex gap-5 item-cen" color={"mint-8"}>
            <Icon size={20} />
            <Typography>{title}</Typography>
          </Div>
          {titleBtn && titleBtn}
        </div>
        <div>{children}</div>
      </div>
    </Card>
  );
}
