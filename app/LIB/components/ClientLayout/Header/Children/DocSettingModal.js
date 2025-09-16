import { useDocument } from "@/app/LIB/context/DocumentContext";
import { useEffect, useState } from "react";
import { Button, Input, Modal, Typography } from "sud-ui";

export default function DocSettingModal({
  setDocSettingModalOpen,
  docSettingModalOpen
}) {
  const { document, saveDocument, loading } = useDocument();

  const inputProps = {
    size: "sm",
    shadow: "none",
    style: { width: "100%" }
  };

  const [documentSetting, setDocumentSetting] = useState(null);

  useEffect(() => {
    if (document) {
      setDocumentSetting(document.docSetting);
    }
  }, [document]);

  const handleChange = (name, value) => {
    setDocumentSetting({ ...documentSetting, [name]: value });
  };

  return (
    <Modal
      open={docSettingModalOpen}
      onClose={() => setDocSettingModalOpen(false)}
    >
      {documentSetting && (
        <div className="flex flex-col gap-10">
          <Typography as="h1" pretendard="B" size="xl">
            문서 설정
          </Typography>

          {/* 페이지 가로 * 세로 */}
          <div className="grid col-2 gap-10">
            <Input
              label="문서 가로"
              {...inputProps}
              value={documentSetting.pageWidth}
              onChange={(e) => handleChange("pageWidth", e.target.value)}
            />
            <Input
              label="문서 세로"
              {...inputProps}
              name="pageHeight"
              value={documentSetting.pageHeight}
              onChange={(e) => handleChange("pageHeight", e.target.value)}
            />
          </div>
          {/* 페이지 가로 * 세로 */}
          <div className="grid col-4 gap-10">
            <Input
              label="상단 여백"
              {...inputProps}
              name="paddingTop"
              value={documentSetting.paddingTop}
              onChange={(e) => handleChange("paddingTop", e.target.value)}
            />
            <Input
              label="하단 여백"
              {...inputProps}
              name="paddingBottom"
              value={documentSetting.paddingBottom}
              onChange={(e) => handleChange("paddingBottom", e.target.value)}
            />
            <Input
              label="왼쪽 여백"
              {...inputProps}
              name="paddingLeft"
              value={documentSetting.paddingLeft}
              onChange={(e) => handleChange("paddingLeft", e.target.value)}
            />
            <Input
              label="오른쪽 여백"
              {...inputProps}
              name="paddingRight"
              value={documentSetting.paddingRight}
              onChange={(e) => handleChange("paddingRight", e.target.value)}
            />
          </div>

          <div className="flex gap-10 justify-center">
            <Button
              background="mint"
              color="mint-1"
              onClick={() => {
                saveDocument(document._id, {
                  ...document,
                  docSetting: documentSetting
                });
                setDocSettingModalOpen(false);
              }}
            >
              저장
            </Button>
            <Button
              onClick={() => {
                setDocSettingModalOpen(false);
                setDocumentSetting(document.docSetting);
              }}
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
