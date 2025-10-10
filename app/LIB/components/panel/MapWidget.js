"use client";
import { useEffect, useRef, useState } from "react";
import WidgetCard from "./WidgetCard";
import { Map } from "sud-icons";

export default function MapWidget({ dragHandleProps }) {
  return (
    <WidgetCard icon={Map} title="지도" dragHandleProps={dragHandleProps}>
      <div className="w-100 flex flex-col gap-10"></div>
    </WidgetCard>
  );
}
