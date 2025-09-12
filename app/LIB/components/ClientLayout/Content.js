import { Div } from "sud-ui";
import { useLayout } from "../../context/LayoutContext";
import PanelContainer from "./PanelContainer";

export default function Content({
  left,
  right,
  children,
  overContainerId,
  containerRef,
  scale
}) {
  const { layoutMode, showLeftPanel, showRightPanel } = useLayout();

  return (
    <Div className="flex w-full" background={"white-9"} ref={containerRef}>
      {/* 왼쪽패널 */}
      {showLeftPanel && (
        <PanelContainer
          side="left"
          widgets={left}
          layoutMode={layoutMode}
          isDropTarget={overContainerId === "left"}
        />
      )}
      {/* 본문 */}
      <div
        className="pd-10 w-100"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center"
        }}
      >
        {children}
      </div>
      {/* 오른쪽패널 */}
      {showRightPanel && (
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
