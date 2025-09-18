import { TbArrowBackUp, TbArrowForwardUp, TbBlockquote } from "react-icons/tb";
import { Code, PhotoOutline, Print } from "sud-icons";
import { AiFillSave } from "react-icons/ai";
import { useEditorContext } from "@/app/LIB/context/EditorContext";
import { ColorPicker, Divider, Select, Upload } from "sud-ui";
import { useEffect, useState } from "react";
import { HiMinus, HiPlus } from "react-icons/hi";
import { GrDocumentConfig } from "react-icons/gr";

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
  PiTextUnderlineBold
} from "react-icons/pi";
import { MdFormatColorText, MdOutlineFormatColorFill } from "react-icons/md";
import DocSettingModal from "./DocSettingModal";
export default function HomeChildren({ renderBtn }) {
  const { editor, printAction, saveAction, downloadPDFAction } =
    useEditorContext();
  const [font, setFont] = useState("Pretendard-Medium");
  const [currentFontSize, setCurrentFontSize] = useState(16);

  const [fontColorPickerOpen, setFontColorPickerOpen] = useState(false);
  const [fontColor, setFontColor] = useState("#000000");

  const [bgColorPickerOpen, setBgColorPickerOpen] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");

  const [docSettingModalOpen, setDocSettingModalOpen] = useState(false);

  const options = [
    // Pretendard
    { value: "Pretendard-Black", label: "프리텐다드 Black" },
    { value: "Pretendard-Bold", label: "프리텐다드 Bold" },
    { value: "Pretendard-ExtraBold", label: "프리텐다드 ExtraBold" },
    { value: "Pretendard-ExtraLight", label: "프리텐다드 ExtraLight" },
    { value: "Pretendard-Light", label: "프리텐다드 Light" },
    { value: "Pretendard-Medium", label: "프리텐다드 Medium" },
    { value: "Pretendard-Regular", label: "프리텐다드 Regular" },
    { value: "Pretendard-SemiBold", label: "프리텐다드 SemiBold" },
    { value: "Pretendard-Thin", label: "프리텐다드 Thin" },

    // NotoSansKR
    { value: "NotoSansKR-Black", label: "노토산스 Black" },
    { value: "NotoSansKR-Bold", label: "노토산스 Bold" },
    { value: "NotoSansKR-ExtraBold", label: "노토산스 ExtraBold" },
    { value: "NotoSansKR-ExtraLight", label: "노토산스 ExtraLight" },
    { value: "NotoSansKR-Light", label: "노토산스 Light" },
    { value: "NotoSansKR-Medium", label: "노토산스 Medium" },
    { value: "NotoSansKR-Regular", label: "노토산스 Regular" },
    { value: "NotoSansKR-SemiBold", label: "노토산스 SemiBold" },
    { value: "NotoSansKR-Thin", label: "노토산스 Thin" },

    // NotoSerifKR
    { value: "NotoSerifKR-Black", label: "노토세리프 Black" },
    { value: "NotoSerifKR-Bold", label: "노토세리프 Bold" },
    { value: "NotoSerifKR-ExtraLight", label: "노토세리프 ExtraLight" },
    { value: "NotoSerifKR-Light", label: "노토세리프 Light" },
    { value: "NotoSerifKR-Medium", label: "노토세리프 Medium" },
    { value: "NotoSerifKR-Regular", label: "노토세리프 Regular" },
    { value: "NotoSerifKR-SemiBold", label: "노토세리프 SemiBold" },

    // GmarketSans
    { value: "GmarketSansTTFBold", label: "지마켓산스 Bold" },
    { value: "GmarketSansTTFLight", label: "지마켓산스 Light" },
    { value: "GmarketSansTTFMedium", label: "지마켓산스 Medium" },

    // KoPubWorld
    { value: "KoPubWorld Batang Bold", label: "Kopub 바탕 Bold" },
    { value: "KoPubWorld Batang Light", label: "Kopub 바탕 Light" },
    { value: "KoPubWorld Batang Medium", label: "Kopub 바탕 Medium" },
    { value: "KoPubWorld Dotum Bold", label: "Kopub 돋움 Bold" },
    { value: "KoPubWorld Dotum Light", label: "Kopub 돋움 Light" },
    { value: "KoPubWorld Dotum Medium", label: "Kopub 돋움 Medium" }
  ];

  useEffect(() => {
    if (!editor) return;

    const updateFontSize = () => {
      const size = editor.getAttributes("textStyle")?.fontSize;
      if (size) {
        // 'px' 단위를 제거하고 숫자로 변환
        setCurrentFontSize(parseInt(size, 10));
      } else {
        // 기본 폰트 크기 (또는 원하는 값)
        setCurrentFontSize(16);
      }
    };

    editor.on("transaction", updateFontSize);
    editor.on("selectionUpdate", updateFontSize);

    return () => {
      editor.off("transaction", updateFontSize);
      editor.off("selectionUpdate", updateFontSize);
    };
  }, [editor]);

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
          options={options}
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
        {/* <Input
          value={currentFontSize}
          size="sm"
          style={{ width: "30px" }}
          border={false}
          shadow="none"
          onChange={(e) => {
            const newSize = parseInt(e.target.value, 10);
            if (!isNaN(newSize) && newSize > 0) {
              setCurrentFontSize(newSize);
              handleFontSize(newSize);
            }
          }}
        /> */}
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
        {/* 글자 배경색 */}
        {/* <div onMouseDown={(event) => event.preventDefault()}>
          <ColorPicker
            open={bgColorPickerOpen}
            setOpen={setBgColorPickerOpen}
            color={bgColor}
            onChange={(color) => {
              setBgColor(color.hex);
              editor?.chain()?.focus()?.setBackgroundColor(color.hex)?.run();
            }}
          >
            {renderBtn(MdOutlineFormatColorFill, () => {}, "")}
          </ColorPicker>
        </div> */}
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

      <DocSettingModal
        setDocSettingModalOpen={setDocSettingModalOpen}
        docSettingModalOpen={docSettingModalOpen}
      />
    </div>
  );
}
