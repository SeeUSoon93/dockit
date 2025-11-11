import { Card, Div, Typography } from "sud-ui";
import { useState } from "react";

export default function WidgetCard({
  icon,
  title,
  children,
  dragHandleProps,
  titleBtn,
  footer,
}) {
  const Icon = icon;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Card
      className="hover-shadow-6"
      size="sm"
      width={"100%"}
      border={false}
      shadow="md"
      footer={footer}
    >
      <div onClick={(e) => e.stopPropagation()} className="flex flex-col">
        <div
          className="flex jus-bet w-100 item-cen cursor-move"
          {...dragHandleProps}
          onDoubleClick={handleDoubleClick}
        >
          <Div className="flex gap-5 item-cen" color={"mint-8"}>
            <Icon size={20} />
            <Typography>{title}</Typography>
          </Div>
          {titleBtn && titleBtn}
        </div>
        <div
          className={`transition-all duration-400 ease-in-out`}
          style={{
            marginTop: isCollapsed ? "0px" : "10px",
            opacity: isCollapsed ? "0" : "1",
            maxHeight: isCollapsed ? "0px" : "1000px",
          }}
        >
          {children}
        </div>
      </div>
    </Card>
  );
}
