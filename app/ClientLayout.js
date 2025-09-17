"use client";

import { useEffect, useRef, useState } from "react";
// context
import { PanelProvider, usePanels } from "./LIB/context/PanelContext";
import { DarkModeProvider, useDarkMode } from "./LIB/context/DarkModeContext";
import { LayoutProvider } from "./LIB/context/LayoutContext";
import { UserProvider, useUser } from "./LIB/context/UserContext";
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
import "sud-ui/dist/index.css";

// theme
import { darkTheme } from "./LIB/config/darkTheme";

// utils
import { handleDragEnd, handleDragOver } from "./LIB/utils/layoutUtils";

// components
import Header from "./LIB/components/ClientLayout/Header";
import Content from "./LIB/components/ClientLayout/Content";
import Drawers from "./LIB/components/ClientLayout/Drawers";
import { usePathname } from "next/navigation";
import { DocumentProvider, useDocument } from "./LIB/context/DocumentContext";
import { SettingProvider } from "./LIB/context/SettingContext";
import { useZoom } from "./LIB/hook/useZoom";
import Footer from "./LIB/components/ClientLayout/Footer";
import { EditorProvider } from "./LIB/context/EditorContext";
import { MemoProvider } from "./LIB/context/MemoContext";
import { widgets } from "./LIB/constant/widgets";

function LayoutContent({ children }) {
  const { document, loadDocument, clearDocument, saveDocument, isSaving } =
    useDocument();
  const { user, userLoading } = useUser();
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const { left, right, setLeft, setRight } = usePanels();

  const { containerRef, scale } = useZoom();
  // 현재
  const pathname = usePathname();
  const isEditPage = pathname.split("/")[1] === "workspace";
  const id = pathname.split("/")[2];

  useEffect(() => {
    if (isEditPage && id) {
      loadDocument(id); // Context의 함수 호출
    } else {
      clearDocument(); // 다른 페이지로 이동 시 데이터 비우기
    }
  }, [isEditPage, id, loadDocument, clearDocument]);
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
        className="flex flex-col w-screen overflow-hidden h-dvh"
        color="mint-10"
        background={"white-9"}
      >
        <DndContext
          sensors={sensors}
          onDragStart={(event) => setActiveId(event.active.id)}
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
            className="z-10 rounded-t-none shadow-sm rounded-b-2xl"
            background="mint-1"
          >
            <Header
              user={user}
              userLoading={userLoading}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              setOpenLeftDrawer={setOpenLeftDrawer}
              setOpenWidgetDrawer={setOpenWidgetDrawer}
              setOpenSettingsDrawer={setOpenSettingsDrawer}
              isEditPage={isEditPage}
              document={document}
              saveDocument={saveDocument}
              isSaving={isSaving}
            />
          </Div>
          {/*■■■■■ 본문 ■■■■■*/}
          <main className="relative z-0 flex-grow overflow-auto">
            <Content
              left={left}
              right={right}
              overContainerId={overContainerId}
              containerRef={containerRef}
              scale={scale}
            >
              {children}
            </Content>
          </main>
          {/* ■■■■■ 푸터 ■■■■■ */}
          {isEditPage && document && (
            <Div className="z-10 shadow-sm" background="mint-1">
              <Footer scale={scale} />
            </Div>
          )}

          {/*■■■■■ 드래그 오버레이 ■■■■■*/}
          <DragOverlay>
            {activeId ? (
              <div className="w-100 max-w-px-350">{widgets[activeId]}</div>
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
            <DocumentProvider>
              <SettingProvider>
                <EditorProvider>
                  <MemoProvider>
                    <LayoutContent>{children}</LayoutContent>
                  </MemoProvider>
                </EditorProvider>
              </SettingProvider>
            </DocumentProvider>
          </PanelProvider>
        </DarkModeProvider>
      </LayoutProvider>
    </UserProvider>
  );
}
