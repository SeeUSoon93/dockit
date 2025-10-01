import { TbArrowBackUp, TbArrowForwardUp, TbBlockquote } from "react-icons/tb";
import { Code, PhotoOutline, Print, ShareFill } from "sud-icons";
import { AiFillSave } from "react-icons/ai";
import { useEditorContext } from "@/app/LIB/context/EditorContext";
import { Button, ColorPicker, Divider, Select, Upload, toast } from "sud-ui";
import { useEffect, useState } from "react";
import { HiMinus, HiPlus } from "react-icons/hi";
import { GrDocumentConfig } from "react-icons/gr";
import { useParams } from "next/navigation";

import {
  PiFilePdfBold,
  PiHighlighterFill,
  PiListBulletsBold,
  PiListChecksBold,
  PiListNumbersBold,
  PiTableFill,
  PiTextAlignCenterBold,
  PiTextAlignLeftBold,
  PiTextAlignRightBold,
  PiTextBBold,
  PiTextIndentFill,
  PiTextItalicBold,
  PiTextOutdentFill,
  PiTextStrikethroughBold,
  PiTextUnderlineBold,
} from "react-icons/pi";
import { MdFormatColorText } from "react-icons/md";
import DocSettingModal from "./DocSettingModal";
import { fontOptions } from "@/app/LIB/constant/fontOptions";
export default function WriteHeader() {
  const { editor, printAction, saveAction, downloadPDFAction } =
    useEditorContext();
  const params = useParams();
  const [font, setFont] = useState("Pretendard-Medium");
  const [currentFontSize, setCurrentFontSize] = useState(16);

  const [fontColorPickerOpen, setFontColorPickerOpen] = useState(false);
  const [fontColor, setFontColor] = useState("#000000");

  const [docSettingModalOpen, setDocSettingModalOpen] = useState(false);

  useEffect(() => {
    if (!editor) return;

    // ✨ 툴바의 상태(폰트 크기, 글꼴)를 한번에 업데이트하는 함수
    const updateToolbarState = () => {
      // 1. 현재 커서의 textStyle 속성을 한번에 가져옵니다.
      const attrs = editor.getAttributes("textStyle");

      // 2. 폰트 크기 상태를 업데이트합니다.
      const fontSize = attrs?.fontSize;
      if (fontSize) {
        setCurrentFontSize(parseInt(fontSize, 10));
      } else {
        setCurrentFontSize(16); // 기본값
      }

      // 3. 폰트 패밀리(글꼴) 상태를 업데이트합니다.
      const fontFamily = attrs?.fontFamily;
      if (fontFamily) {
        setFont(fontFamily);
      } else {
        setFont("Pretendard-Medium"); // 기본값
      }
    };

    // 4. 에디터의 내용이나 선택 영역이 변경될 때마다 툴바 상태를 업데이트합니다.
    editor.on("transaction", updateToolbarState);
    editor.on("selectionUpdate", updateToolbarState);

    // 5. 컴포넌트가 처음 로드될 때 초기 상태를 설정합니다.
    updateToolbarState();

    // 6. 컴포넌트가 사라질 때 이벤트 리스너를 정리합니다.
    return () => {
      editor.off("transaction", updateToolbarState);
      editor.off("selectionUpdate", updateToolbarState);
    };
  }, [editor]); // 의존성 배열은 그대로 [editor] 입니다.

  // [추가] 폰트 크기 변경 로직을 처리하는 함수
  const handleFontSize = (size) => {
    if (editor) {
      // setFontSize 대신 setMark를 사용하고, px 단위를 붙여줍니다.
      editor
        ?.chain()
        ?.focus()
        ?.setMark("textStyle", { fontSize: `${size}px` })
        .run();
    }
  };

  const renderBtn = (icon, action, extraClass = "") => {
    const Icon = icon;
    return (
      <Button
        colorType="text"
        onClick={() => {
          if (editor && !editor.isDestroyed && editor.isEditable) {
            action();
          }
        }}
        className={`cursor-pointer ${extraClass}`}
        icon={<Icon size={16} />}
        style={{ padding: "4px" }}
      />
    );
  };

  const handleUploadImg = (file) => {
    if (!file) return;
    console.log(file);
    const reader = new FileReader();
    reader.onload = () => {
      const img = reader.result;
      editor?.chain()?.focus()?.setImage({ src: img, width: "100%" }).run();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex gap-5 items-center">
      {/* 취소 & 재실행 */}
      {renderBtn(
        TbArrowBackUp,
        () => editor?.chain()?.focus()?.undo()?.run(),
        ""
      )}
      {renderBtn(
        TbArrowForwardUp,
        () => editor?.chain()?.focus()?.redo()?.run(),
        ""
      )}
      {/* 인쇄 & 저장 */}
      {renderBtn(Print, () => printAction?.(), "")}
      {renderBtn(AiFillSave, () => saveAction?.(), "")}
      <Divider
        vertical
        style={{ height: "20px", margin: "0" }}
        borderColor="mint"
      />
      {/* 폰트 패밀리 설정 */}
      <div onMouseDown={(event) => event.preventDefault()}>
        <Select
          colorType="text"
          size="sm"
          shadow="none"
          options={fontOptions}
          border={false}
          value={font}
          onChange={(value) => {
            console.log(value);
            setFont(value);
            // 2. 에디터에 즉시 폰트 변경 명령 실행
            editor?.chain()?.focus()?.setFontFamily(value)?.run();
          }}
        />
      </div>
      <Divider
        vertical
        style={{ height: "20px", margin: "0" }}
        borderColor="mint"
      />
      {/* 폰트 크기 설정 */}
      <div
        className="flex items-center gap-1"
        onMouseDown={(event) => {
          // [수정] 클릭된 요소의 태그 이름이 'INPUT'이 아닐 때만 기본 동작을 막습니다.
          if (event.target.tagName !== "INPUT") {
            event.preventDefault();
          }
        }}
      >
        {renderBtn(
          HiMinus,
          // 새로운 핸들러 함수를 사용
          () => handleFontSize(currentFontSize - 1),
          !editor,
          ""
        )}
        <span>{currentFontSize}px</span>
        {renderBtn(
          HiPlus,
          // 새로운 핸들러 함수를 사용
          () => handleFontSize(currentFontSize + 1),
          !editor,
          ""
        )}
      </div>
      <Divider
        vertical
        style={{ height: "20px", margin: "0" }}
        borderColor="mint"
      />
      {/* 폰트 굵기 등 스타일 */}
      <>
        {renderBtn(
          PiTextBBold,
          () => editor.chain()?.focus()?.toggleBold()?.run(),
          ""
        )}
        {renderBtn(
          PiTextItalicBold,
          () => editor.chain()?.focus()?.toggleItalic()?.run(),
          ""
        )}
        {renderBtn(
          PiTextStrikethroughBold,
          () => editor.chain()?.focus()?.toggleStrike()?.run(),

          ""
        )}
        {renderBtn(
          PiTextUnderlineBold,
          () => editor.chain()?.focus()?.toggleUnderline()?.run(),
          ""
        )}
      </>
      {/* 색상 */}
      <>
        {/* 글자색 */}
        <div onMouseDown={(event) => event.preventDefault()}>
          <ColorPicker
            open={fontColorPickerOpen}
            setOpen={setFontColorPickerOpen}
            color={fontColor}
            onChange={(color) => {
              setFontColor(color.hex);
              editor?.chain()?.focus()?.setColor(color.hex)?.run();
            }}
          >
            {renderBtn(MdFormatColorText, () => {}, "")}
          </ColorPicker>
        </div>
      </>
      <Divider
        vertical
        style={{ height: "20px", margin: "0" }}
        borderColor="mint"
      />
      {/* 정렬 */}
      <>
        {renderBtn(
          PiTextAlignLeftBold,
          () => editor?.chain()?.focus()?.setTextAlign("left")?.run(),
          ""
        )}
        {renderBtn(
          PiTextAlignCenterBold,
          () => editor?.chain()?.focus()?.setTextAlign("center")?.run(),
          ""
        )}
        {renderBtn(
          PiTextAlignRightBold,
          () => editor?.chain()?.focus()?.setTextAlign("right")?.run(),
          ""
        )}
        {/* [추가] 들여쓰기 & 내어쓰기 버튼 */}
        {renderBtn(
          PiTextOutdentFill,
          () => editor?.chain()?.focus()?.outdent()?.run(),
          ""
        )}
        {renderBtn(
          PiTextIndentFill,
          () => editor?.chain()?.focus()?.indent()?.run(),
          ""
        )}
      </>
      <Divider
        vertical
        style={{ height: "20px", margin: "0" }}
        borderColor="mint"
      />
      {/* highlight */}
      <>
        {renderBtn(
          PiHighlighterFill,
          () => editor?.chain()?.focus()?.toggleHighlight()?.run(),
          ""
        )}
      </>
      <Divider
        vertical
        style={{ height: "20px", margin: "0" }}
        borderColor="mint"
      />
      {/* 리스트 */}
      <>
        {renderBtn(
          PiListBulletsBold,
          () => editor?.chain()?.focus()?.toggleBulletList()?.run(),
          ""
        )}
        {renderBtn(
          PiListNumbersBold,
          () => editor?.chain()?.focus()?.toggleOrderedList()?.run(),
          ""
        )}
        {renderBtn(
          PiListChecksBold,
          () => editor?.chain()?.focus()?.toggleTaskList()?.run(),
          ""
        )}
      </>
      <Divider
        vertical
        style={{ height: "20px", margin: "0" }}
        borderColor="mint"
      />
      {/* 인용, 코드, 테이블 */}
      <>
        {renderBtn(
          TbBlockquote,
          () => editor?.chain()?.focus()?.toggleBlockquote()?.run(),
          ""
        )}
        {renderBtn(
          Code,
          () => editor?.chain()?.focus()?.toggleCodeBlock()?.run(),
          ""
        )}
        {renderBtn(
          PiTableFill,
          () =>
            editor
              ?.chain()
              ?.focus()
              ?.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run(),
          ""
        )}
        <Upload
          listType="none"
          onChange={(img) => {
            handleUploadImg(img);
          }}
        >
          {renderBtn(PhotoOutline, () => {}, "")}
        </Upload>
      </>
      <Divider
        vertical
        style={{ height: "20px", margin: "0" }}
        borderColor="mint"
      />
      {/* 문서 설정 */}
      <>
        {renderBtn(GrDocumentConfig, () => setDocSettingModalOpen(true), "")}
        {renderBtn(PiFilePdfBold, () => downloadPDFAction?.(), "")}
      </>
      <Divider
        vertical
        style={{ height: "20px", margin: "0" }}
        borderColor="mint"
      />
      {renderBtn(
        ShareFill,
        () => {
          const shareUrl = `${window.location.origin}/share/${params.id}`;
          navigator.clipboard.writeText(shareUrl);
          toast.success("공유 링크가 복사되었습니다!");
        },
        ""
      )}

      <DocSettingModal
        setDocSettingModalOpen={setDocSettingModalOpen}
        docSettingModalOpen={docSettingModalOpen}
      />
    </div>
  );
}
