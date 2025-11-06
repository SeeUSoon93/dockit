import { TbDatabaseSmile } from "react-icons/tb";
import WidgetCard from "./WidgetCard";
import { Select } from "sud-ui";
import { inputProps } from "../../constant/uiProps";
import { useState } from "react";
import { selectOptions } from "./DataPortalComponent/selectOptions";
import HEALTH_FOOD_INFO from "./DataPortalComponent/HEALTH_FOOD_INFO";
import TOUR_PHOTO from "./DataPortalComponent/TOUR_PHOTO";

export default function DataPortal({ dragHandleProps }) {
  const [selectedData, setSelectedData] = useState(null);

  return (
    <WidgetCard
      icon={TbDatabaseSmile}
      title="공공데이터"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10 max-h-px-350 overflow-y-auto">
        <Select
          {...inputProps}
          options={selectOptions}
          value={selectedData}
          onChange={(value) => setSelectedData(value)}
          searchable
        />
        {selectedData === "HEALTH_FOOD_INFO" && <HEALTH_FOOD_INFO />}
        {selectedData === "TOUR_PHOTO" && <TOUR_PHOTO />}
      </div>
    </WidgetCard>
  );
}
