import { TbArrowBackUp, TbArrowForwardUp } from "react-icons/tb";
import { Print } from "sud-icons";
import { AiFillSave } from "react-icons/ai";
import { useEditorContext } from "@/app/LIB/context/EditorContext";
import { Button, Divider, Dropdown, Select } from "sud-ui";
import { use, useEffect, useState } from "react";
export default function HomeChildren({ renderBtn }) {
  const { editor, printAction, saveAction } = useEditorContext();
  const [font, setFont] = useState("Pretendard-Medium");
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

  return (
    <div className="flex gap-5 items-center">
      {/* 취소 & 재실행 */}
      {renderBtn(
        TbArrowBackUp,
        () => editor?.chain().focus().undo().run(),
        !editor?.can().undo(),
        ""
      )}
      {renderBtn(
        TbArrowForwardUp,
        () => editor?.chain().focus().redo().run(),
        !editor?.can().redo(),
        ""
      )}
      {/* 인쇄 & 저장 */}
      {renderBtn(Print, () => printAction?.(), !printAction, "")}
      {renderBtn(AiFillSave, () => saveAction?.(), !saveAction, "")}
      <Divider
        vertical
        style={{ height: "20px", margin: "0" }}
        borderColor="mint"
      />
      {/* 폰트 설정 */}
      <div className="w-px-150" onMouseDown={(event) => event.preventDefault()}>
        <Select
          background={"mint-1"}
          size="sm"
          shadow="none"
          options={options}
          underline
          value={font}
          onChange={(value) => {
            console.log(value);
            setFont(value);
            // 2. 에디터에 즉시 폰트 변경 명령 실행
            editor?.chain().focus().setFontFamily(value).run();
          }}
        />
      </div>
    </div>
  );
}
