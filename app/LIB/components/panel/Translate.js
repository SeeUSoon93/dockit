import {
  Button,
  Input,
  Typography,
  Select,
  Card,
  Textarea,
  toast
} from "sud-ui";
import WidgetCard from "./WidgetCard";
import { BsTranslate } from "react-icons/bs";
import { useState } from "react";
import { API_BASE_URL } from "../../config/config";
import { languages } from "../../constant/widget_constant";
import { HiMiniArrowsUpDown } from "react-icons/hi2";

export default function Translate({ dragHandleProps }) {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("ko");
  const [targetLang, setTargetLang] = useState("en");

  const translateText = async () => {
    if (!sourceText.trim()) return;
    setTranslatedText("");
    try {
      const params = new URLSearchParams({
        text: sourceText,
        source_lang: sourceLang,
        target_lang: targetLang
      });

      const response = await fetch(
        `${API_BASE_URL}/widget/translate?${params}`
      );
      const data = await response.json();

      if (data.error) throw new Error(data.error);
      if (!data.translated_text)
        throw new Error("번역 결과를 받을 수 없습니다.");

      setTranslatedText(data.translated_text);
    } catch (error) {
      console.error(error);
    }
  };

  const swapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    setSourceText(translatedText);
    setTranslatedText("");
  };

  const selectProps = {
    size: "sm",
    searchable: true,
    options: languages,
    shadow: "none",
    border: false,
    background: "mint-2"
  };

  return (
    <WidgetCard
      icon={BsTranslate}
      title="번역기"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        <Textarea
          placeholder="번역할 텍스트를 입력하세요... (Shift+Enter로 번역)"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault();
              translateText();
            }
          }}
          rows={3}
          shadow="none"
          background="mint-1"
        />

        <Card width="100%" shadow="none" border={false} background={"mint-2"}>
          <div className="flex flex-col items-center">
            <Select
              value={sourceLang}
              onChange={setSourceLang}
              {...selectProps}
            />
            <Button
              icon={<HiMiniArrowsUpDown />}
              colorType="text"
              onClick={swapLanguages}
            />
            <Select
              value={targetLang}
              onChange={setTargetLang}
              {...selectProps}
            />
          </div>
        </Card>

        <Card
          shadow="none"
          background="mint-1"
          width="100%"
          className="cursor-pointer"
          onClick={() => {
            if (translatedText) {
              navigator.clipboard.writeText(translatedText);
              toast.success("클립보드에 복사되었습니다.");
            }
          }}
          style={{ maxHeight: "150px", overflowY: "auto" }}
        >
          <Typography style={{ whiteSpace: "pre-wrap" }}>
            {translatedText || ""}
          </Typography>
        </Card>
      </div>
    </WidgetCard>
  );
}
