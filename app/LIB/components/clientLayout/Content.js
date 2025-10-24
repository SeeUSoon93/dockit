import { Div } from "sud-ui";
import { useLayout } from "../../context/LayoutContext";
import PanelContainer from "./PanelContainer";
import { useDocument } from "../../context/DocumentContext";
import { usePathname } from "next/navigation";
import { useSetting } from "../../context/SettingContext";

export default function Content({
  left,
  right,
  children,
  overContainerId,
  containerRef,
  scale
}) {
  const { layoutMode, showLeftPanel, showRightPanel } = useLayout();
  const { document } = useDocument();
  const isDocument = document !== null;
  const isWorkspace = usePathname().includes("workspace");
  const isShare = usePathname().includes("share");
  const { setting } = useSetting();

  // 패널 활성화 상태 확인
  const panelLeft = setting.panelLeft ?? true;
  const panelRight = setting.panelRight ?? true;
  const hasLeftPanel = showLeftPanel && isDocument && panelLeft;
  const hasRightPanel = showRightPanel && isDocument && panelRight;
  const hasBothPanels = hasLeftPanel && hasRightPanel;

  return (
    <Div
      className={`flex w-full h-full gap-10 ${
        hasBothPanels ? "justify-between" : "justify-center"
      }`}
      background={isDocument || isShare ? "white-9" : "white-10"}
      ref={containerRef}
    >
      {/* 왼쪽패널 */}
      {showLeftPanel && isDocument && setting.panelLeft && (
        <PanelContainer
          side="left"
          widgets={left}
          layoutMode={layoutMode}
          isDropTarget={overContainerId === "left"}
        />
      )}
      {/* 본문 */}
      <Div
        className={`overflow-y-auto ${
          isDocument || isShare ? "" : "flex justify-center"
        }`}
        style={{
          width:
            isDocument || isShare
              ? `${setting.workspaceWidth || 800}px`
              : layoutMode === "mobile"
              ? "100vw"
              : "100%",
          transform: `scale(${scale})`,
          transformOrigin: "top center"
        }}
        background={isWorkspace || isShare ? "white-9" : "white-10"}
      >
        {children}
      </Div>
      {/* 오른쪽패널 */}
      {showRightPanel && isDocument && setting.panelRight && (
        <PanelContainer
          side="right"
          widgets={right}
          layoutMode={layoutMode}
          isDropTarget={overContainerId === "right"}
        />
      )}
    </Div>
  );
}
