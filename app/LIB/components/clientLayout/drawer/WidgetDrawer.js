import Template from "./Template";
import { Button, Div, Drawer, Tag, Typography } from "sud-ui";

import { FaBookBookmark, FaCalculator, FaNoteSticky } from "react-icons/fa6";
import { MdImageSearch, MdKeyboardCommandKey } from "react-icons/md";
import { usePanels } from "@/app/LIB/context/PanelContext";
import { TbChartDotsFilled, TbEdit } from "react-icons/tb";
import { PiListNumbersFill, PiTreeViewBold } from "react-icons/pi";
import { CalendarOutline, TimerOutline } from "sud-icons";
import { BsTranslate } from "react-icons/bs";

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
    <Drawer
      open={openWidgetDrawer}
      onClose={() => setOpenWidgetDrawer(false)}
      width="400px"
    >
      <Template
        title="위젯"
        content={
          <div className="flex flex-col gap-10">
            <Typography pretendard="SB">문서 작성</Typography>

            <div className="grid col-4 w-100 gap-20">
              {renderWidgetItem(
                MdKeyboardCommandKey,
                "특수문자",
                "specialChar"
              )}
              {renderWidgetItem(PiListNumbersFill, "목차", "index")}
              {renderWidgetItem(TbChartDotsFilled, "차트", "madeChart")}
              {renderWidgetItem(TbEdit, "편집기", "objectEditor")}
            </div>
            <Typography pretendard="SB">자료 탐색</Typography>
            <div className="grid col-4 w-100 gap-20">
              {renderWidgetItem(FaBookBookmark, "사전", "dictionary")}
              {renderWidgetItem(MdImageSearch, "이미지 검색", "imageSearch")}
            </div>
            <Typography pretendard="SB">기타 도구</Typography>
            <div className="grid col-4 w-100 gap-20">
              {renderWidgetItem(BsTranslate, "번역기", "translate")}
              {renderWidgetItem(FaNoteSticky, "메모장", "memo")}
              {renderWidgetItem(FaCalculator, "계산기", "calculator")}
              {renderWidgetItem(CalendarOutline, "달력", "calendar")}
              {renderWidgetItem(TimerOutline, "타이머", "timer")}
            </div>
          </div>
        }
      />
    </Drawer>
  );
}
