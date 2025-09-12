"use client";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { widgets } from "../../constant/widgets";
import React from "react";
import { Div } from "sud-ui";

function SortableWidget({ id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto",
    opacity: isDragging ? 0 : 1
  };
  const WidgetComponent = widgets[id];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="w-100 max-w-px-350"
    >
      {WidgetComponent &&
        React.cloneElement(WidgetComponent, { dragHandleProps: listeners })}
    </div>
  );
}

export default function PanelContainer({
  side,
  widgets,
  layoutMode,
  isDropTarget
}) {
  const { setNodeRef } = useDroppable({
    id: side
  });

  return (
    <SortableContext
      id={side}
      items={widgets}
      strategy={verticalListSortingStrategy}
    >
      <Div
        ref={setNodeRef}
        className={`panel-${side} sticky top-0 flex flex-col items-${
          side === "left" ? "start" : "end"
        } pd-10 overflow-y-auto h-100`}
        background={isDropTarget && "mint-2"}
        style={{
          width:
            layoutMode === "desktop"
              ? "calc((100vw - 800px) / 2)"
              : "calc(100vw - 800px)"
        }}
      >
        {widgets.map((widgetId) => (
          <SortableWidget key={widgetId} id={widgetId} />
        ))}
      </Div>
    </SortableContext>
  );
}
