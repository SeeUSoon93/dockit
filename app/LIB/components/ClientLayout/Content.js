import { useLayout } from "../../context/LayoutContext";

export default function Content({ left, right, children, overContainerId }) {
  const {
    layoutMode,
    setLayoutMode,
    showLeftPanel,
    showRightPanel,
    toggleLeftPanel,
    toggleRightPanel
  } = useLayout();
  return (
    <div>
      {/* 왼쪽패널 */}
      {showLeftPanel && (
        <div
          side="left"
          widgets={left}
          layoutMode={layoutMode}
          isDropTarget={overContainerId === "left"}
        ></div>
      )}
      {/* 본문 */}
      <div>{children}</div>
      {/* 오른쪽패널 */}
      {showRightPanel && (
        <div
          side="right"
          widgets={right}
          layoutMode={layoutMode}
          isDropTarget={overContainerId === "right"}
        ></div>
      )}
    </div>
  );
}
