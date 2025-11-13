import { TbDatabaseSmile } from "react-icons/tb";
import WidgetCard from "./WidgetCard";
import { Select, Typography } from "sud-ui";
import { inputProps } from "../../constant/uiProps";
import { useState } from "react";
import { selectOptions } from "./DataPortalComponent/selectOptions";
import HEALTH_FOOD_INFO from "./DataPortalComponent/HEALTH_FOOD_INFO";
import TOUR_PHOTO from "./DataPortalComponent/TOUR_PHOTO";
import MOUNTAIN_INFO from "./DataPortalComponent/MOUNTAIN_INFO";
import HACCP_PRODUCT_INFO from "./DataPortalComponent/HACCP_PRODUCT_INFO";
import POPULATION_INFO from "./DataPortalComponent/POPULATION_INFO";
import COUNTRY_INFO from "./DataPortalComponent/COUNTRY_INFO";
import NK_TV_SCHEDULE from "./DataPortalComponent/NK_TV_SCHEDULE";
import CULTURE_INFO from "./DataPortalComponent/CULTURE_INFO";
import FESTIVAL_INFO from "./DataPortalComponent/FESTIVAL_INFO";
import SOCIAL_ENTERPRISE_INFO from "./DataPortalComponent/SOCIAL_ENTERPRISE_INFO";

export default function DataPortal({ dragHandleProps }) {
  const [selectedData, setSelectedData] = useState(null);

  const footer = () => {
    if (selectedData) {
      let footerText = "";
      if (selectedData === "HEALTH_FOOD_INFO") {
        footerText = "식품의약품안전처";
      }
      if (selectedData === "TOUR_PHOTO") {
        footerText = "한국관광공사";
      }
      if (selectedData === "MOUNTAIN_INFO") {
        footerText = "산림청";
      }
      if (selectedData === "HACCP_PRODUCT_INFO") {
        footerText = "한국식품안전관리인증원";
      }
      if (selectedData === "POPULATION_INFO") {
        footerText = "행정안전부";
      }
      if (selectedData === "COUNTRY_INFO") {
        footerText = "외교부";
      }
      if (selectedData === "NK_TV_SCHEDULE") {
        footerText = "통일부";
      }
      if (selectedData === "CULTURE_INFO" || selectedData === "FESTIVAL_INFO") {
        footerText = "문화체육관광부";
      }
      if (selectedData === "SOCIAL_ENTERPRISE_INFO") {
        footerText = "한국사회적기업진흥원";
      }
      return (
        <div className="flex jus-end">
          <Typography size="xs" color="cool-gray-7">
            출처 : {footerText}
          </Typography>
        </div>
      );
    }
    return null;
  };

  return (
    <WidgetCard
      icon={TbDatabaseSmile}
      title="공공데이터"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10 max-h-px-400 overflow-y-auto">
        <Select
          {...inputProps}
          options={selectOptions}
          value={selectedData}
          onChange={(value) => setSelectedData(value)}
          searchable
        />
        {selectedData === "HEALTH_FOOD_INFO" && <HEALTH_FOOD_INFO />}
        {selectedData === "TOUR_PHOTO" && <TOUR_PHOTO />}
        {selectedData === "MOUNTAIN_INFO" && <MOUNTAIN_INFO />}
        {selectedData === "HACCP_PRODUCT_INFO" && <HACCP_PRODUCT_INFO />}
        {selectedData === "POPULATION_INFO" && <POPULATION_INFO />}
        {selectedData === "COUNTRY_INFO" && <COUNTRY_INFO />}
        {selectedData === "NK_TV_SCHEDULE" && <NK_TV_SCHEDULE />}
        {selectedData === "CULTURE_INFO" && <CULTURE_INFO />}
        {selectedData === "FESTIVAL_INFO" && <FESTIVAL_INFO />}
        {selectedData === "SOCIAL_ENTERPRISE_INFO" && (
          <SOCIAL_ENTERPRISE_INFO />
        )}
      </div>
      {footer()}
    </WidgetCard>
  );
}
