import { RiImageAiFill } from "react-icons/ri";
import WidgetCard from "./WidgetCard";
import { useState } from "react";
import { imageModel } from "../../config/firebaseConfig";
import {
  Button,
  Card,
  DotSpinner,
  Image,
  Modal,
  Textarea,
  Typography,
} from "sud-ui";
import { Download, MapArrowFill } from "sud-icons";
import { createData } from "../../utils/dataUtils";
import { useLayout } from "../../context/LayoutContext";

export default function AiImage({ dragHandleProps }) {
  const { layoutMode } = useLayout();
  const [input, setInput] = useState("");
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const model = imageModel;
  const sendMessage = async () => {
    if (input.trim() === "") return;
    setLoading(true);
    try {
      const result = await model.generateContent(input);
      const inlineDataParts = result.response.inlineDataParts();
      if (inlineDataParts?.[0]) {
        const imageData = inlineDataParts[0].inlineData;
        setImgUrl(`data:${imageData.mimeType};base64,${imageData.data}`);
        await createData("ai-image", null, {
          title: input,
          content: imgUrl,
        });
      }
    } catch (err) {
      console.error("Prompt or candidate was blocked:", err);
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  const handleDownloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("이미지 다운로드 실패:", error);
    }
  };

  return (
    <WidgetCard
      icon={RiImageAiFill}
      title="AI 이미지"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        {loading && (
          <div className="flex justify-center items-center">
            <DotSpinner />
          </div>
        )}
        {imgUrl && (
          <Image
            src={imgUrl}
            alt="AI 이미지"
            width="100%"
            preview={false}
            onClick={() => {
              setOpenModal(true);
            }}
          />
        )}

        {/* 입력창 */}
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`메시지를 입력하세요
(Shift+Enter 또는 버튼으로 메시지 전송)`}
          rows={2}
          shadow="none"
          bottomRight={
            <Button
              size="sm"
              icon={<MapArrowFill size={16} />}
              onClick={sendMessage}
              disabled={loading}
            />
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
      </div>
      {imgUrl && (
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          width={layoutMode === "desktop" ? "50vw" : "90vw"}
          className="overflow-y-auto"
          thumb={imgUrl}
          border={false}
          style={{ maxHeight: "80vh" }}
        >
          <div className="flex flex-col gap-15">
            <div className="flex justify-end">
              <Download
                size={18}
                onClick={() => handleDownloadImage(imgUrl)}
                className="cursor-pointer"
              />
            </div>
            {/* 사진 설명 */}
            <Card width={"100%"} shadow="none">
              <Typography>{input}</Typography>
            </Card>
          </div>
        </Modal>
      )}
    </WidgetCard>
  );
}
