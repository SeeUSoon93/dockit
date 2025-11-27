import { Div } from "sud-ui";
import { useLayout } from "../../context/LayoutContext";
import PanelContainer from "./PanelContainer";
import { useDocument } from "../../context/DocumentContext";
import { usePathname } from "next/navigation";
import { useSetting } from "../../context/SettingContext";
import { Splitter } from "antd";
import { createStyles } from "antd-style";

const useStyles = createStyles(({ token }) => ({
  dragger: {
    "&::before": {
      backgroundColor: "transparent !important",
      border: `1px solid transparent`,
    },
    "&:hover::before": {
      border: `1px solid #e0e0e0`,
    },
  },
  draggerActive: {
    "&::before": {
      border: `1px solid #e0e0e0`,
    },
  },
}));

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
  const isWorkspace = usePathname().includes("workspace");
  const isShare = usePathname().includes("share");
  const { setting, setSetting } = useSetting();

  const hasLeftPanel = showLeftPanel && isDocument;
  const hasRightPanel = showRightPanel && isDocument;

  const { styles } = useStyles();

  if (isWorkspace) {
    if (isDocument) {
      return (
        <Div className="flex w-full h-full" background="white-9">
          <Splitter
            ref={containerRef}
            onResizeEnd={(size) => {
              const leftPanelWidth = parseFloat(size[0]);
              const rightPanelWidth = parseFloat(size[2]);
              setSetting({
                ...setting,
                panelLeft: leftPanelWidth,
                panelRight: rightPanelWidth,
              });
            }}
            classNames={{
              dragger: {
                default: styles.dragger,
                active: styles.draggerActive,
              },
            }}
            style={{ width: "100%" }}
          >
            {/* 왼쪽 패널 */}
            {(hasLeftPanel || layoutMode == "desktop") && (
              <Splitter.Panel
                collapsible={{
                  start: true,
                  end: true,
                  showCollapsibleIcon: "auto",
                }}
                defaultSize={setting.panelLeft}
                max={"25%"}
                style={{ overflowX: "hidden" }}
              >
                <PanelContainer
                  side="left"
                  widgets={left}
                  layoutMode={layoutMode}
                  isDropTarget={overContainerId === "left"}
                />
              </Splitter.Panel>
            )}
            {/* 본문 */}
            <Splitter.Panel
              collapsible={{
                start: true,
                end: true,
                showCollapsibleIcon: "auto",
              }}
              min="50%"
            >
              <Div
                className="overflow-y-auto flex justify-center w-full min-h-full"
                background="white-9"
              >
                {children}
              </Div>
            </Splitter.Panel>

            {/* 오른쪽 패널 */}
            {(hasRightPanel || layoutMode !== "mobile") && (
              <Splitter.Panel
                collapsible={{
                  start: true,
                  end: true,
                  showCollapsibleIcon: "auto",
                }}
                defaultSize={setting.panelRight}
                max={"25%"}
                style={{ overflowX: "hidden" }}
              >
                <PanelContainer
                  side="right"
                  widgets={right}
                  layoutMode={layoutMode}
                  isDropTarget={overContainerId === "right"}
                />
              </Splitter.Panel>
            )}
          </Splitter>
        </Div>
      );
    } else {
      return (
        <Div className="flex w-full h-full" background="white-9">
          <Div
            className="overflow-y-auto flex justify-center w-full"
            background="white-9"
          >
            {children}
          </Div>
        </Div>
      );
    }
  }
  if (isShare) {
    return (
      <Div
        className="overflow-y-auto flex justify-center w-full min-h-full"
        background="white-9"
      >
        {children}
      </Div>
    );
  }
  return children;
}
