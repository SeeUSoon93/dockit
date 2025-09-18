import Template from "./Template";
import { Button, Div, Drawer, Typography } from "sud-ui";

import { FaBookBookmark, FaCalculator, FaNoteSticky } from "react-icons/fa6";
import { MdKeyboardCommandKey } from "react-icons/md";
import { usePanels } from "@/app/LIB/context/PanelContext";
import { TbEdit } from "react-icons/tb";

export default function WidgetDrawer({
  openWidgetDrawer,
  setOpenWidgetDrawer
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
      <Div
        className="flex flex-col item-cen gap-5"
        color={isRegistered && "mint"}
      >
        <Button
          icon={<Icon size="24" />}
          onClick={() => registerWidget(key)}
          background={isRegistered && "mint"}
          color={isRegistered && "mint-1"}
        />
        <Typography pretendard="SB">{title}</Typography>
      </Div>
    );
  };

  return (
    <Drawer open={openWidgetDrawer} onClose={() => setOpenWidgetDrawer(false)}>
      <Template
        title="위젯"
        content={
          <div className="grid col-3 w-100 gap-20">
            {renderWidgetItem(TbEdit, "편집기", "objectEditor")}
            {renderWidgetItem(FaBookBookmark, "사전", "dictionary")}
            {renderWidgetItem(FaNoteSticky, "메모장", "memo")}
            {renderWidgetItem(FaCalculator, "계산기", "calculator")}
            {renderWidgetItem(MdKeyboardCommandKey, "특수문자", "specialChar")}
          </div>
        }
      />
    </Drawer>
  );
}
