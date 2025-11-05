import Template from "./Template";
import { Button, Div, Drawer, Tag, Typography } from "sud-ui";

import {
  FaBookBookmark,
  FaCalculator,
  FaDice,
  FaNoteSticky,
  FaWikipediaW,
} from "react-icons/fa6";
import { MdImageSearch, MdKeyboardCommandKey, MdMuseum } from "react-icons/md";
import { usePanels } from "@/app/LIB/context/PanelContext";
import {
  TbChartDotsFilled,
  TbDatabaseSmile,
  TbEdit,
  TbMath,
} from "react-icons/tb";
import { PiListNumbersFill, PiTreeViewBold } from "react-icons/pi";
import { CalendarOutline, Korea, Map, TimerOutline } from "sud-icons";
import { BsMusicPlayerFill, BsTranslate } from "react-icons/bs";
import { RiChatAiFill, RiImageAiFill } from "react-icons/ri";
import { GiSouthKorea, GiStarSattelites } from "react-icons/gi";
import { IoSyncCircle } from "react-icons/io5";

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
    <Template
      open={openWidgetDrawer}
      onClose={() => setOpenWidgetDrawer(false)}
      title="위젯"
      content={
        <div className="flex flex-col gap-30 overflow-y-auto max-h-[calc(100dvh-100px)]">
          <div className="flex flex-col gap-10">
            {/* AI */}
            <Typography pretendard="SB">AI(Beta)</Typography>
            <div className="grid col-4 w-100 gap-20">
              {renderWidgetItem(RiChatAiFill, "AI 채팅", "aiChat")}
              {renderWidgetItem(RiImageAiFill, "AI 이미지", "aiImage")}
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {/* 문서 작성 */}
            <Typography pretendard="SB">문서 작성</Typography>
            <div className="grid col-4 w-100 gap-20">
              {renderWidgetItem(
                MdKeyboardCommandKey,
                "특수문자",
                "specialChar"
              )}
              {renderWidgetItem(TbMath, "LATEX", "latex")}
              {renderWidgetItem(PiListNumbersFill, "목차", "index")}
              {renderWidgetItem(TbChartDotsFilled, "차트", "madeChart")}
              {renderWidgetItem(TbEdit, "편집기", "objectEditor")}
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {/* 자료 탐색 */}
            <Typography pretendard="SB">자료 탐색</Typography>
            <div className="grid col-4 w-100 gap-20">
              {renderWidgetItem(FaBookBookmark, "사전", "dictionary")}
              {renderWidgetItem(MdImageSearch, "이미지 검색", "imageSearch")}
              {renderWidgetItem(GiSouthKorea, "행정지도", "geoJson")}
              {renderWidgetItem(Map, "지도", "map")}
              {renderWidgetItem(TbDatabaseSmile, "공공데이터", "dataPortal")}
              {/* {renderWidgetItem(FaWikipediaW, "위키", "wikipediaSearch")} */}
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {/* 도구 */}
            <Typography pretendard="SB">도구</Typography>
            <div className="grid col-4 w-100 gap-20">
              {renderWidgetItem(BsTranslate, "번역기", "translate")}
              {renderWidgetItem(FaNoteSticky, "메모장", "memo")}
              {renderWidgetItem(FaCalculator, "계산기", "calculator")}
              {renderWidgetItem(CalendarOutline, "달력", "calendar")}
              {renderWidgetItem(TimerOutline, "타이머", "timer")}
            </div>
          </div>
          <div className="flex flex-col gap-10">
            {/* 기타 */}
            <Typography pretendard="SB">기타</Typography>
            <div className="grid col-4 w-100 gap-20">
              {renderWidgetItem(GiStarSattelites, "띠별 운세", "fortune")}
              {renderWidgetItem(FaDice, "주사위", "dice")}
              {renderWidgetItem(
                BsMusicPlayerFill,
                "음악 플레이어",
                "musicPlayer"
              )}
            </div>
          </div>
        </div>
      }
    />
  );
}
