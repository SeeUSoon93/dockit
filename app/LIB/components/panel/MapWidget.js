"use client";
import { useState } from "react";
import WidgetCard from "./WidgetCard";
import { Map } from "sud-icons";
import { Input, Modal } from "sud-ui";
import { inputProps } from "../../constant/uiProps";
import MapModal from "./MapComponent/MapModal";

export default function MapWidget({ dragHandleProps }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);

  return (
    <WidgetCard icon={Map} title="지도" dragHandleProps={dragHandleProps}>
      <div className="w-100 flex flex-col gap-10">
        <Input
          {...inputProps}
          placeholder="지도 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onEnter={() => setOpenModal(true)}
        />
      </div>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        width="90vw"
        thumb={
          <MapModal searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        }
        border={false}
      />
    </WidgetCard>
  );
}
