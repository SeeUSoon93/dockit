import Template from "./Template";
import { Button, Div, Drawer, Typography } from "sud-ui";

import { FaBookBookmark, FaCalculator, FaNoteSticky } from "react-icons/fa6";
import { MdKeyboardCommandKey } from "react-icons/md";
import { usePanels } from "@/app/LIB/context/PanelContext";
import { TbChartDotsFilled, TbEdit } from "react-icons/tb";
import { PiListNumbersFill, PiTreeViewBold } from "react-icons/pi";
import { CalendarOutline, TimerOutline } from "sud-icons";

export default function WidgetDrawer({
  openWidgetDrawer,
  setOpenWidgetDrawer,
}) {
  const { left, right, toggle } = usePanels();

  // 위젯 등록
  const registerWidget = (type) => {
    toggle(type);
  };

  const renderWidgetItem = (icon, title, key) => {
    const Icon = icon;

    const isRegistered = left.includes(key) || right.includes(key);

    return (
      <Div className="flex flex-col item-cen gap-5">
        <Button
          icon={<Icon size="24" />}
          onClick={() => registerWidget(key)}
          background={isRegistered && "mint-7"}
          color={isRegistered ? "mint-1" : "mint-7"}
        />
        <Typography pretendard="R" size="sm" color={isRegistered && "mint-8"}>
          {title}
        </Typography>
      </Div>
    );
  };

  return (
    <Drawer open={openWidgetDrawer} onClose={() => setOpenWidgetDrawer(false)}>
      <Template
        title="위젯"
        content={
          <div className="grid col-4 w-100 gap-20">
            {renderWidgetItem(TbEdit, "편집기", "objectEditor")}
            {renderWidgetItem(FaBookBookmark, "사전", "dictionary")}
            {renderWidgetItem(FaNoteSticky, "메모장", "memo")}
            {renderWidgetItem(FaCalculator, "계산기", "calculator")}
            {renderWidgetItem(MdKeyboardCommandKey, "특수문자", "specialChar")}
            {renderWidgetItem(TbChartDotsFilled, "차트", "madeChart")}
            {renderWidgetItem(PiListNumbersFill, "목차", "index")}
            {renderWidgetItem(CalendarOutline, "달력", "calendar")}
            {renderWidgetItem(TimerOutline, "타이머", "timer")}
          </div>
        }
      />
    </Drawer>
  );
}
