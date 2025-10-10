import { Input, Typography } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { FaWikipediaW } from "react-icons/fa6";
import { useState } from "react";
import { inputProps } from "../../constant/uiProps";

export default function WikipediaSearch({ dragHandleProps }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");

  const searchWikipedia = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      const encodedTerm = encodeURIComponent(searchTerm);
      const wikiUrl = `https://ko.wikipedia.org/wiki/${encodedTerm}`;
      setCurrentUrl(wikiUrl);
    }
  };
  return (
    <WidgetCard
      icon={FaWikipediaW}
      title="Wiki"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10 max-h-px-300 overflow-y-auto">
        <div className="flex jus-bet">
          <Input
            {...inputProps}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="위키피디아 검색..."
            onEnter={searchWikipedia}
          />
        </div>

        {currentUrl ? (
          <iframe
            src={currentUrl}
            className="w-100 h-96 border rounded"
            title="Wikipedia"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        ) : (
          <div className="flex jus-cen item-cen w-100 h-96">
            <Typography color={"cool-gray-7"}>
              검색어를 입력하고 Enter를 눌러주세요.
            </Typography>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
