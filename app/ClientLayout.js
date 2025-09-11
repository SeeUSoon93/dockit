"use client";

// context
import { PanelProvider, usePanels } from "./LIB/context/PanelContext";
import { DarkModeProvider, useDarkMode } from "./LIB/context/DarkModeContext";
import { LayoutProvider } from "./LIB/context/LayoutContext";
import { UserProvider } from "./LIB/context/UserContext";
// dnd-kit
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

// sud-ui
import { Div, SoonUIDesign } from "sud-ui";
import Header from "./LIB/components/ClientLayout/Header";
import { useEffect, useRef, useState } from "react";
import { darkTheme } from "./LIB/config/darkTheme";
import { handleDragEnd, handleDragOver } from "./LIB/utils/layoutUtils";
import Content from "./LIB/components/ClientLayout/Content";
import Drawers from "./LIB/components/ClientLayout/Drawers";

function LayoutContent({ children }) {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const { left, right, setLeft, setRight } = usePanels();

  //■■■■■■■■■■■■ 헤더 높이 측정 ■■■■■■■■■■■■■■■■■■■■■■
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    // headerRef.current (헤더 div)의 사이즈가 변경될 때마다 실행됨
    const observer = new ResizeObserver((entries) => {
      // entries[0].contentRect.height로 실제 높이를 가져옴
      const newHeight = entries[0]?.contentRect?.height || 0;
      setHeaderHeight(newHeight);
    });
    // 관찰 시작
    if (headerRef.current) {
      observer.observe(headerRef.current);
    }
    // 컴포넌트 언마운트 시 관찰 중지
    return () => {
      observer.disconnect();
    };
  }, []);

  //■■■■■■■■■■■■ 위젯 관련 상태 ■■■■■■■■■■■■■■■■■■■■■■
  const [activeId, setActiveId] = useState(null); // 현재 드래그 중인 아이템의 ID
  const [overContainerId, setOverContainerId] = useState(null);

  //■■■■■■■■■■■■ Drawer 관련 상태 ■■■■■■■■■■■■■■■■■
  const [openLeftDrawer, setOpenLeftDrawer] = useState(false);
  const [openWidgetDrawer, setOpenWidgetDrawer] = useState(false);
  const [openSettingsDrawer, setOpenSettingsDrawer] = useState(false);

  //■■■■■■■■■■■■ dnd-kit 센서 설정 ■■■■■■■■■■■■■■■■■■
  //  (PointerSensor 사용, 8px 이동 시 드래그 시작)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  return (
    <SoonUIDesign isDarkMode={isDarkMode} darkTheme={darkTheme}>
      <Div
        className="h-dvh w-screen flex flex-col relative"
        background="mint-1"
        color="mint-10"
      >
        <DndContext
          sensors={sensors}
          onDragStart={(event) => setActiveId(event, setActiveId)}
          onDragEnd={(event) =>
            handleDragEnd(
              event,
              setActiveId,
              left,
              right,
              setLeft,
              setRight,
              arrayMove,
              setOverContainerId
            )
          }
          onDragOver={(event) =>
            handleDragOver(event, setOverContainerId, left, right)
          }
        >
          {/*■■■■■ 헤더 ■■■■■*/}
          <Div
            ref={headerRef}
            className="absolute top-0 left-0 right-0 z-10 shadow-sm rounded-b-2xl rounded-t-none"
            background="mint-1"
          >
            <Header
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              setOpenLeftDrawer={setOpenLeftDrawer}
              setOpenWidgetDrawer={setOpenWidgetDrawer}
              setOpenSettingsDrawer={setOpenSettingsDrawer}
            />
          </Div>
          {/*■■■■■ 본문 ■■■■■*/}
          <main
            className="flex-grow flex justify-center"
            style={{ paddingTop: `${headerHeight}px` }}
          >
            <Content
              left={left}
              right={right}
              overContainerId={overContainerId}
            >
              {children}
            </Content>
          </main>
          {/*■■■■■ 드래그 오버레이 ■■■■■*/}
          <DragOverlay>
            {activeId ? (
              <div className="w-100 max-w-px-350">
                {/* 복사할 위젯 들어갈 곳 */}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        {/*■■■■■ 드로어 ■■■■■*/}
        <Drawers
          openLeftDrawer={openLeftDrawer}
          setOpenLeftDrawer={setOpenLeftDrawer}
          openWidgetDrawer={openWidgetDrawer}
          setOpenWidgetDrawer={setOpenWidgetDrawer}
          openSettingsDrawer={openSettingsDrawer}
          setOpenSettingsDrawer={setOpenSettingsDrawer}
        />
      </Div>
    </SoonUIDesign>
  );
}

export default function ClientLayout({ children }) {
  return (
    <UserProvider>
      <LayoutProvider>
        <DarkModeProvider>
          <PanelProvider>
            <LayoutContent>{children}</LayoutContent>
          </PanelProvider>
        </DarkModeProvider>
      </LayoutProvider>
    </UserProvider>
  );
}
