import { useDocument } from "@/app/LIB/context/DocumentContext";
import { useEffect, useState } from "react";
import { SettingOutline } from "sud-icons";
import { Button, Divider, Input, Modal, Select, Typography } from "sud-ui";

export default function DocSettingModal({
  setDocSettingModalOpen,
  docSettingModalOpen
}) {
  const {
    document,
    saveDocument,
    docSetting,
    setDocSetting,
    bulletStyle,
    setBulletStyle
  } = useDocument();

  const inputProps = {
    size: "sm",
    shadow: "none",
    style: { width: "100%" }
  };

  const [pageSize, setPageSize] = useState("A4");
  const pageSizeOptions = [
    { label: "A4(210 x 297)", value: "A4" },
    { label: "A3(297 x 420)", value: "A3" },
    { label: "B4(257 x 364)", value: "B4" },
    { label: "B5(182 x 257)", value: "B5" },
    { label: "Web(1280 x 1024)", value: "Web" },
    { label: "Tablet(768 x 1024)", value: "Tablet" },
    { label: "Mobile(480 x 800)", value: "Mobile" },
    { label: "Custom", value: "Custom" }
  ];

  useEffect(() => {
    if (pageSize === "A4") {
      setDocSetting({ ...docSetting, pageWidth: 210, pageHeight: 297 });
    } else if (pageSize === "A3") {
      setDocSetting({ ...docSetting, pageWidth: 297, pageHeight: 420 });
    } else if (pageSize === "B4") {
      setDocSetting({ ...docSetting, pageWidth: 257, pageHeight: 364 });
    } else if (pageSize === "B5") {
      setDocSetting({ ...docSetting, pageWidth: 182, pageHeight: 257 });
    } else if (pageSize === "Web") {
      setDocSetting({ ...docSetting, pageWidth: 1280, pageHeight: 1024 });
    } else if (pageSize === "Tablet") {
      setDocSetting({ ...docSetting, pageWidth: 768, pageHeight: 1024 });
    } else if (pageSize === "Mobile") {
      setDocSetting({ ...docSetting, pageWidth: 480, pageHeight: 800 });
    }
  }, [pageSize]);

  useEffect(() => {
    if (!bulletStyle) {
      setBulletStyle({
        h1: "decimal",
        h2: "decimal",
        h3: "decimal",
        "list-1": "disc",
        "list-2": "disc",
        "list-3": "disc",
        "list-4": "disc",
        "order-list-1": "decimal-dot",
        "order-list-2": "decimal-dot",
        "order-list-3": "decimal-dot",
        "order-list-4": "decimal-dot"
      });
    }
  }, [bulletStyle]);

  const handleChange = (name, value) => {
    setDocSetting({ ...docSetting, [name]: value });
  };

  const handleBulletStyleChange = (level, value) => {
    setBulletStyle({ ...bulletStyle, [level]: value });
  };

  const bulletOptions = [
    { label: "1", value: "decimal" },
    { label: "I", value: "upper-roman" },
    { label: "i", value: "lower-roman" },
    { label: "A", value: "upper-alpha" },
    { label: "a", value: "lower-alpha" },
    { label: "ㄱ", value: "korean" },
    { label: "가", value: "korean-2" }
  ];
  const listOptions = [
    { label: "•", value: "disc" },
    { label: "-", value: "dash" },
    { label: "○", value: "circle-outline" },
    { label: "●", value: "circle-filled" },
    { label: "□", value: "square-outline" },
    { label: "■", value: "square-filled" },
    { label: "◇", value: "diamond-outline" },
    { label: "◆", value: "diamond-filled" }
  ];

  const orderOptions = [
    { label: "1.", value: "decimal-dot" },
    { label: "1)", value: "decimal-paren" },
    { label: "I.", value: "upper-roman-dot" },
    { label: "I)", value: "upper-roman-paren" },
    { label: "i.", value: "lower-roman-dot" },
    { label: "i)", value: "lower-roman-paren" },
    { label: "A.", value: "upper-alpha-dot" },
    { label: "A)", value: "upper-alpha-paren" },
    { label: "a.", value: "lower-alpha-dot" },
    { label: "a)", value: "lower-alpha-paren" },
    { label: "ㄱ.", value: "korean-dot" },
    { label: "ㄱ)", value: "korean-paren" },
    { label: "가.", value: "korean-2-dot" },
    { label: "가)", value: "korean-2-paren" }
  ];

  return (
    <Modal
      open={docSettingModalOpen}
      onClose={() => setDocSettingModalOpen(false)}
    >
      {docSetting && bulletStyle && (
        <div className="flex flex-col gap-20">
          <div className="flex items-center gap-5">
            <SettingOutline size={25} />
            <Typography as="h1" pretendard="B" size="xl">
              설정
            </Typography>
          </div>
          {/* 문서 설정 */}
          <>
            <div className="flex justify-center">
              <Typography as="h2" pretendard="B" size="lg">
                문서 설정
              </Typography>
            </div>
            {/* 페이지 가로 * 세로 */}
            <div className="flex flex-col gap-5">
              <Select
                {...inputProps}
                options={pageSizeOptions}
                placeholder="페이지 크기"
                value={pageSize}
                onChange={(value) => setPageSize(value)}
              />
              <div className="grid col-2 gap-10">
                <Input
                  label="문서 가로"
                  {...inputProps}
                  value={docSetting.pageWidth}
                  onChange={(e) => handleChange("pageWidth", e.target.value)}
                  disabled={pageSize !== "Custom"}
                />
                <Input
                  label="문서 세로"
                  {...inputProps}
                  name="pageHeight"
                  value={docSetting.pageHeight}
                  onChange={(e) => handleChange("pageHeight", e.target.value)}
                  disabled={pageSize !== "Custom"}
                />
              </div>
              <Typography as="p" size="xs" pretendard="B">
                * 문서 세로 크기는 PDF로 내보낼때 적용됩니다.
              </Typography>
            </div>
            {/* 페이지 가로 * 세로 */}
            <div className="grid col-4 gap-10">
              <Input
                label="상단 여백"
                {...inputProps}
                name="paddingTop"
                value={docSetting.paddingTop}
                onChange={(e) => handleChange("paddingTop", e.target.value)}
              />
              <Input
                label="하단 여백"
                {...inputProps}
                name="paddingBottom"
                value={docSetting.paddingBottom}
                onChange={(e) => handleChange("paddingBottom", e.target.value)}
              />
              <Input
                label="왼쪽 여백"
                {...inputProps}
                name="paddingLeft"
                value={docSetting.paddingLeft}
                onChange={(e) => handleChange("paddingLeft", e.target.value)}
              />
              <Input
                label="오른쪽 여백"
                {...inputProps}
                name="paddingRight"
                value={docSetting.paddingRight}
                onChange={(e) => handleChange("paddingRight", e.target.value)}
              />
            </div>
          </>
          <Divider style={{ margin: 0 }} />
          {/* 글머리 기호 설정 */}
          <>
            <div className="flex flex-col gap-5">
              <div className="flex justify-center">
                <Typography as="h2" pretendard="B" size="lg">
                  글머리 기호 설정
                </Typography>
              </div>
              {/* 제목 */}
              <div className="grid grid-cols-3 gap-10">
                <div className="flex flex-col gap-5">
                  <Typography as="p" size="sm" pretendard="B">
                    제목 1(H1)
                  </Typography>
                  <div className="flex flex-wrap gap-5">
                    <Select
                      {...inputProps}
                      options={bulletOptions}
                      placeholder="번호 스타일"
                      onChange={(value) => handleBulletStyleChange("h1", value)}
                      value={bulletStyle["h1"]}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <Typography as="p" size="sm" pretendard="B">
                    제목 2(H2)
                  </Typography>
                  <div className="flex flex-wrap gap-5">
                    <Select
                      {...inputProps}
                      options={bulletOptions}
                      placeholder="번호 스타일"
                      onChange={(value) => handleBulletStyleChange("h2", value)}
                      value={bulletStyle["h2"]}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <Typography as="p" size="sm" pretendard="B">
                    제목 3(H3)
                  </Typography>
                  <div className="flex flex-wrap gap-5">
                    <Select
                      {...inputProps}
                      options={bulletOptions}
                      placeholder="번호 스타일"
                      onChange={(value) => handleBulletStyleChange("h3", value)}
                      value={bulletStyle["h3"]}
                    />
                  </div>
                </div>
              </div>
              {/* 리스트 */}
              <div className="grid grid-cols-4 gap-10">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div className="flex flex-col gap-5" key={index}>
                    <Typography as="p" size="sm" pretendard="B">
                      리스트 {index + 1}
                    </Typography>
                    <div className="flex flex-wrap gap-5">
                      <Select
                        {...inputProps}
                        options={listOptions}
                        placeholder="스타일"
                        onChange={(value) =>
                          handleBulletStyleChange(`list-${index + 1}`, value)
                        }
                        value={bulletStyle[`list-${index + 1}`]}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-10">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div className="flex flex-col gap-5" key={index}>
                    <Typography as="p" size="sm" pretendard="B">
                      번호 {index + 1}
                    </Typography>
                    <div className="flex flex-wrap gap-5">
                      <Select
                        {...inputProps}
                        options={orderOptions}
                        placeholder="스타일"
                        onChange={(value) =>
                          handleBulletStyleChange(
                            `order-list-${index + 1}`,
                            value
                          )
                        }
                        value={bulletStyle[`order-list-${index + 1}`]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>

          <div className="flex gap-10 justify-center">
            <Button
              background="mint"
              color="mint-1"
              onClick={() => {
                saveDocument(document._id);
                setDocSettingModalOpen(false);
              }}
            >
              저장
            </Button>
            <Button
              onClick={() => {
                setDocSettingModalOpen(false);
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
