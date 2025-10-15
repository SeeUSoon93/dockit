"use client";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { widgets } from "../../constant/widgets";
import React from "react";
import { Div } from "sud-ui";
import { useSetting } from "../../context/SettingContext";

function SortableWidget({ id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto",
    opacity: isDragging ? 0 : 1,
  };
  const WidgetComponent = widgets[id];

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="w-100">
      {WidgetComponent &&
        React.cloneElement(WidgetComponent, { dragHandleProps: listeners })}
    </div>
  );
}

export default function PanelContainer({
  side,
  widgets,
  layoutMode,
  isDropTarget,
}) {
  const { setNodeRef } = useDroppable({
    id: side,
  });

  const { setting } = useSetting();

  const panelWidth = setting.panelWidth || 350;
  const workspaceWidth = setting.workspaceWidth || 800;
  const panelLeft = setting.panelLeft ?? true;
  const panelRight = setting.panelRight ?? true;

  return (
    <SortableContext
      id={side}
      items={widgets}
      strategy={verticalListSortingStrategy}
    >
      <Div
        ref={setNodeRef}
        className={`panel-${side} sticky top-0 flex flex-col item-${
          side === "left" ? "sta jus-end" : "end"
        } overflow-y-auto pd-20 gap-20 h-full z-10`}
        background={isDropTarget && "white-8"}
        style={{
          width: `${panelWidth}px`,
          maxWidth: (() => {
            if (layoutMode !== "desktop") {
              return `calc(100vw - ${workspaceWidth}px)`;
            }

            // 데스크톱 모드에서 한쪽 패널만 활성화된 경우
            const isOnlyLeftActive = panelLeft && !panelRight;
            const isOnlyRightActive = !panelLeft && panelRight;

            if (isOnlyLeftActive || isOnlyRightActive) {
              return `calc(100vw - ${workspaceWidth}px)`;
            }

            // 양쪽 패널 모두 활성화된 경우
            return `calc((100vw - ${workspaceWidth}px) / 2)`;
          })(),
        }}
      >
        {widgets.map((widgetId) => (
          <SortableWidget key={widgetId} id={widgetId} />
        ))}
      </Div>
    </SortableContext>
  );
}
