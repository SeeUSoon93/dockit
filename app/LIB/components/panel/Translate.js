import { Button, Input, Typography, Select, Card } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { BsTranslate, BsArrowLeftRight } from "react-icons/bs";
import { useState } from "react";

export default function Translate({ dragHandleProps }) {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("ko");
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { value: "auto", label: "자동 감지" },
    { value: "ko", label: "한국어" },
    { value: "en", label: "영어" },
    { value: "ja", label: "일본어" },
    { value: "zh", label: "중국어" },
    { value: "es", label: "스페인어" },
    { value: "fr", label: "프랑스어" },
    { value: "de", label: "독일어" },
    { value: "ru", label: "러시아어" },
    { value: "ar", label: "아랍어" },
  ];

  const translateText = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    try {
      // 간단한 번역 시뮬레이션 (실제로는 API 호출 필요)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기

      // 실제 번역을 위해서는 다음 중 하나를 사용해야 합니다:
      // 1. 자체 libretranslate 서버 호스팅
      // 2. Google Translate API
      // 3. DeepL API
      // 4. Azure Translator API

      setTranslatedText(`[번역 결과] ${sourceText} → ${targetLang}로 번역됨`);
    } catch (error) {
      console.error("번역 오류:", error);
      setTranslatedText(
        "번역 서버가 필요합니다. libretranslate를 직접 호스팅하거나 다른 번역 API를 사용하세요."
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);

    // 텍스트도 교체
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const clearText = () => {
    setSourceText("");
    setTranslatedText("");
  };

  return (
    <WidgetCard
      icon={BsTranslate}
      title="번역기"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        {/* 언어 선택 */}
        <div className="flex gap-5 items-center">
          <Select
            value={sourceLang}
            onChange={setSourceLang}
            options={languages}
            size="sm"
            style={{ flex: 1 }}
          />
          <Button
            onClick={swapLanguages}
            size="sm"
            colorType="text"
            icon={<BsArrowLeftRight size={16} />}
          />
          <Select
            value={targetLang}
            onChange={setTargetLang}
            options={languages.filter((lang) => lang.value !== "auto")}
            size="sm"
            style={{ flex: 1 }}
          />
        </div>

        {/* 입력 텍스트 */}
        <div className="flex flex-col gap-5">
          <Input
            placeholder="번역할 텍스트를 입력하세요..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            multiline
            rows={4}
            size="sm"
          />

          <div className="flex gap-5">
            <Button
              onClick={translateText}
              disabled={!sourceText.trim() || isTranslating}
              size="sm"
              colorType="primary"
              loading={isTranslating}
            >
              {isTranslating ? "번역 중..." : "번역"}
            </Button>
            <Button onClick={clearText} size="sm" colorType="text">
              지우기
            </Button>
          </div>
        </div>

        {/* 번역 결과 */}
        {translatedText && (
          <Card shadow="none" background="cool-gray-1">
            <Typography size="sm" color="cool-gray-6" className="mg-b-5">
              번역 결과:
            </Typography>
            <Typography size="sm" style={{ whiteSpace: "pre-wrap" }}>
              {translatedText}
            </Typography>
          </Card>
        )}
      </div>
    </WidgetCard>
  );
}
