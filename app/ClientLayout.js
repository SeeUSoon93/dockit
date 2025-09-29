"use client";

import { useState } from "react";
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
  useSensors,
} from "@dnd-kit/core";
// sud-ui
import { Div, SoonUIDesign } from "sud-ui";
import "sud-ui/dist/index.css";

// theme
import { darkTheme } from "./LIB/config/darkTheme";

// components
import Header from "./LIB/components/clientLayout/Header";
import Content from "./LIB/components/clientLayout/Content";
import Drawers from "./LIB/components/clientLayout/Drawers";
import { DocumentProvider } from "./LIB/context/DocumentContext";
import { SettingProvider } from "./LIB/context/SettingContext";
import { useZoom } from "./LIB/hook/useZoom";
import Footer from "./LIB/components/clientLayout/Footer";
import { EditorProvider } from "./LIB/context/EditorContext";
import { MemoProvider } from "./LIB/context/MemoContext";
import { widgets } from "./LIB/constant/widgets";

// 커스텀 훅들
import { useDocumentManager } from "./LIB/hook/useDocumentManager";
import { useDragState } from "./LIB/hook/useDragState";
import { DrawerProvider } from "./LIB/context/DrawerContext";

function LayoutContent({ children }) {
  // 커스텀 훅들 사용
  const { document, isEditPage } = useDocumentManager();
  const { user, userLoading } = useUser();
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const { left, right, setLeft, setRight } = usePanels();
  const { containerRef, scale } = useZoom();

  // 드래그 상태 관리
  const {
    activeId,
    overContainerId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  } = useDragState();

  // 드로어 상태는 Context로 관리됨

  //■■■■■■■■■■■■ dnd-kit 센서 설정 ■■■■■■■■■■■■■■■■■■
  //  (PointerSensor 사용, 8px 이동 시 드래그 시작)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  return (
    <SoonUIDesign isDarkMode={isDarkMode} darkTheme={darkTheme}>
      <Div
        className="flex flex-col w-screen overflow-hidden h-dvh"
        color="mint-10"
        background={"white-10"}
        id="main-layout"
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={(event) =>
            handleDragEnd(event, left, right, setLeft, setRight)
          }
          onDragOver={(event) => handleDragOver(event, left, right)}
        >
          {/*■■■■■ 헤더 ■■■■■*/}
          <Div
            className="z-10 rounded-t-none shadow-md rounded-b-2xl"
            background="mint-1"
            id="header"
          >
            <Header
              user={user}
              userLoading={userLoading}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              isEditPage={isEditPage}
              document={document}
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
        <Drawers />
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
                    <DrawerProvider>
                      <LayoutContent>{children}</LayoutContent>
                    </DrawerProvider>
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
