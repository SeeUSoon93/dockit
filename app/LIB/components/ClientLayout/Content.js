import { Div } from "sud-ui";
import { useLayout } from "../../context/LayoutContext";
import PanelContainer from "./PanelContainer";
import { useDocument } from "../../context/DocumentContext";

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

  return (
    <Div
      className="flex w-full h-full"
      background={"white-9"}
      ref={containerRef}
    >
      {/* 왼쪽패널 */}
      {showLeftPanel && isDocument && (
        <div className="h-full overflow-y-auto">
          <PanelContainer
            side="left"
            widgets={left}
            layoutMode={layoutMode}
            isDropTarget={overContainerId === "left"}
          />
        </div>
      )}
      {/* 본문 */}
      <div
        className="pd-10 w-px-800 overflow-y-auto"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center"
        }}
      >
        {children}
      </div>
      {/* 오른쪽패널 */}
      {showRightPanel && isDocument && (
        <div className="h-full overflow-y-auto">
          <PanelContainer
            side="right"
            widgets={right}
            layoutMode={layoutMode}
            isDropTarget={overContainerId === "right"}
          />
        </div>
      )}
    </Div>
  );
}
