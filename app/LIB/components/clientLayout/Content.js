import { Div } from "sud-ui";
import { useLayout } from "../../context/LayoutContext";
import PanelContainer from "./PanelContainer";
import { useDocument } from "../../context/DocumentContext";
import { usePathname } from "next/navigation";

export default function Content({
  left,
  right,
  children,
  overContainerId,
  containerRef,
  scale,
}) {
  const { layoutMode, showLeftPanel, showRightPanel } = useLayout();
  const { document } = useDocument();
  const isDocument = document !== null;
  const isShare = usePathname().includes("share");

  return (
    <Div
      className="flex w-full h-full"
      background={isDocument || isShare ? "white-9" : "white-10"}
      ref={containerRef}
    >
      {/* 왼쪽패널 */}
      {showLeftPanel && isDocument && (
        <PanelContainer
          side="left"
          widgets={left}
          layoutMode={layoutMode}
          isDropTarget={overContainerId === "left"}
        />
      )}
      {/* 본문 */}
      <Div
        className={`w-100 overflow-y-auto ${
          isDocument || isShare ? "" : "flex justify-center"
        }`}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
        background={isDocument || isShare ? "white-9" : "white-10"}
      >
        {children}
      </Div>
      {/* 오른쪽패널 */}
      {showRightPanel && isDocument && (
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
