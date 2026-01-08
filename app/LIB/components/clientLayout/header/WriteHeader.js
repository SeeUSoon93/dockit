import {
  TbArrowBackUp,
  TbArrowForwardUp,
  TbBlockquote,
  TbColumns,
} from "react-icons/tb";
import { Code, PhotoOutline, Print, ShareFill } from "sud-icons";
import { AiFillSave } from "react-icons/ai";
import { useEditorContext } from "@/app/LIB/context/EditorContext";
import {
  Button,
  ColorPicker,
  Divider,
  Input,
  Select,
  Upload,
  toast,
} from "sud-ui";
import { useEffect, useState, useRef } from "react";
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
  PiTextAlignJustifyBold,
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
import { LuSubscript, LuSuperscript } from "react-icons/lu";
import { findParentNode } from "@tiptap/core";
import { inputProps } from "@/app/LIB/constant/uiProps";
import AddTeamMemberModal from "./AddTeamMemberModal";
import { RiTeamFill } from "react-icons/ri";
export default function WriteHeader() {
  const { editor, printAction, saveAction, downloadPDFAction } =
    useEditorContext();
  const params = useParams();
  const [font, setFont] = useState("Pretendard-Medium");
  const [currentFontSize, setCurrentFontSize] = useState(16);

  const [fontColorPickerOpen, setFontColorPickerOpen] = useState(false);
  const [fontColor, setFontColor] = useState("#000000");

  const [docSettingModalOpen, setDocSettingModalOpen] = useState(false);

  // 팀원 추가 모달 상태
  const [addTeamMemberModalOpen, setAddTeamMemberModalOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState([]);

  // 에디터 선택 상태를 저장하기 위한 ref
  const savedSelectionRef = useRef(null);
  // Input의 실제 DOM 요소를 참조하기 위한 ref
  const fontSizeInputRef = useRef(null);

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

  // Input의 실제 input 요소에 포커스 이벤트 리스너 추가
  useEffect(() => {
    if (!fontSizeInputRef.current) return;

    // Input 컴포넌트 내부의 실제 input 요소 찾기
    const findInputElement = (element) => {
      if (!element) return null;
      if (element.tagName === "INPUT") return element;
      return element.querySelector("input");
    };

    const inputElement = findInputElement(fontSizeInputRef.current);
    if (!inputElement) return;

    // 포커스 이벤트 리스너 추가
    const handleFocus = () => {
      // Input에 포커스가 가기 전에 에디터 선택 상태 저장
      if (editor) {
        const { from, to } = editor.state.selection;
        if (from !== to) {
          savedSelectionRef.current = { from, to };
        }
      }
    };

    // mousedown 이벤트로도 처리 (포커스보다 먼저 실행)
    const handleMouseDown = () => {
      if (editor) {
        const { from, to } = editor.state.selection;
        if (from !== to) {
          savedSelectionRef.current = { from, to };
        }
      }
    };

    inputElement.addEventListener("mousedown", handleMouseDown, true);
    inputElement.addEventListener("focus", handleFocus, true);

    return () => {
      inputElement.removeEventListener("mousedown", handleMouseDown, true);
      inputElement.removeEventListener("focus", handleFocus, true);
    };
  }, [editor, fontSizeInputRef]);

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
  const handleColumnToggle = () => {
    const { selection } = editor.state;
    const predicate = (node) => node.type.name === "columnBlock";
    const parentNodeInfo = findParentNode(predicate)(selection);

    if (parentNodeInfo) {
      const columnBlockNode = parentNodeInfo.node;
      const currentCols = columnBlockNode.childCount;
      const nodePos = parentNodeInfo.pos;
      const deletionRange = {
        from: nodePos,
        to: nodePos + columnBlockNode.nodeSize,
      };

      if (currentCols >= 4) {
        // 내용물 복사 없이, 블록 삭제 후 빈 단락 1개만 삽입
        editor
          .chain()
          .focus()
          .deleteRange(deletionRange)
          .insertContentAt(deletionRange.from, { type: "paragraph" })
          .run();
      } else {
        const nextCols = currentCols + 1;
        const newColumns = Array.from({ length: nextCols }, () => ({
          type: "column",
          content: [{ type: "paragraph" }],
        }));

        const newColumnBlock = {
          type: "columnBlock",
          content: newColumns,
        };

        editor
          .chain()
          .focus()
          .deleteRange(deletionRange)
          .insertContentAt(deletionRange.from, newColumnBlock)
          .run();
      }
    } else {
      editor.chain().focus().setColumns(2).run();
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

  const weightPriority = {
    Thin: 1,
    ExtraLight: 2,
    Light: 3,
    Regular: 4,
    Medium: 5,
    SemiBold: 6,
    Bold: 7,
    ExtraBold: 8,
    Black: 9,
    // 학교안심 등 특수 접미사 처리
    R: 4,
    B: 7,
    "Puzzle Outline": 1,
    "Puzzle Black": 9,
  };

  const sortedFontOptions = [...fontOptions].sort((a, b) => {
    const labelA = a.label;
    const labelB = b.label;

    // 1. 언어 판별 (영어 우선)
    const isEngA = /^[A-Za-z]/.test(labelA);
    const isEngB = /^[A-Za-z]/.test(labelB);

    if (isEngA && !isEngB) return -1;
    if (!isEngA && isEngB) return 1;

    // 2. 이름과 굵기 분리 로직
    const getInfo = (label) => {
      // 가중치 키워드들을 긴 것부터 정렬하여 매칭 (ExtraLight가 Light보다 먼저 매칭되도록)
      const weights = Object.keys(weightPriority).sort(
        (x, y) => y.length - x.length
      );
      let family = label;
      let weightScore = 4; // 기본값 Regular

      for (const w of weights) {
        if (label.includes(w)) {
          family = label.replace(w, "").trim(); // 폰트 패밀리 이름만 추출
          weightScore = weightPriority[w];
          break;
        }
      }
      return { family, weightScore };
    };

    const infoA = getInfo(labelA);
    const infoB = getInfo(labelB);

    // 3. 폰트 이름(Family)이 다르면 가나다/알파벳 순 정렬
    if (infoA.family !== infoB.family) {
      return infoA.family.localeCompare(infoB.family, "ko");
    }

    // 4. 이름이 같으면 굵기(Weight) 가중치 순 정렬
    return infoA.weightScore - infoB.weightScore;
  });

  return (
    <div className="flex gap-5 items-center overflow-x-auto">
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
          options={sortedFontOptions}
          style={{ width: "200px", overflow: "hidden" }}
          border={false}
          value={font}
          searchable
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
        <div
          ref={fontSizeInputRef}
          onMouseDown={(e) => {
            // Input 영역 클릭 시 에디터 선택 상태 저장
            // onMouseDown은 onFocus보다 먼저 실행됨
            if (editor) {
              const { from, to } = editor.state.selection;
              if (from !== to) {
                savedSelectionRef.current = { from, to };
              }
            }
          }}
        >
          <Input
            className="text-xs"
            value={currentFontSize}
            onChange={(e) => {
              const value = e.target.value;
              setCurrentFontSize(value);

              // 숫자로 변환 가능한 경우에만 폰트 크기 적용
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue) && numValue > 0 && editor) {
                // 저장된 선택 상태가 있으면 즉시 복원하고 폰트 크기 적용
                if (savedSelectionRef.current) {
                  const { from, to } = savedSelectionRef.current;
                  // 동기적으로 선택 복원 및 폰트 크기 적용
                  editor
                    .chain()
                    .setTextSelection({ from, to })
                    .setMark("textStyle", { fontSize: `${numValue}px` })
                    .run();
                } else {
                  // 선택 상태가 없으면 현재 커서 위치에 적용
                  handleFontSize(numValue);
                }
              }
            }}
            onBlur={() => {
              // Input에서 포커스가 벗어날 때 에디터에 다시 포커스
              if (editor && savedSelectionRef.current) {
                const { from, to } = savedSelectionRef.current;
                setTimeout(() => {
                  editor.chain().setTextSelection({ from, to }).focus().run();
                  savedSelectionRef.current = null;
                }, 0);
              }
            }}
            onKeyDown={(e) => {
              // Enter 키를 누르면 포커스를 에디터로 돌려보냄
              if (e.key === "Enter") {
                e.preventDefault();
                if (editor && savedSelectionRef.current) {
                  const { from, to } = savedSelectionRef.current;
                  editor.chain().setTextSelection({ from, to }).focus().run();
                  savedSelectionRef.current = null;
                }
              }
            }}
            {...inputProps}
            suffix={"px"}
            style={{ width: "50px" }}
            border={false}
            background="transparent"
          />
        </div>
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
            mode="preset"
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
          PiTextAlignJustifyBold,
          () => editor?.chain()?.focus()?.setTextAlign("justify")?.run(),
          ""
        )}
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
        {renderBtn(TbColumns, () => handleColumnToggle(), "")}
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
      {/* 위 첨자 & 아래 첨자 */}
      <>
        {renderBtn(
          LuSuperscript,
          () => editor?.chain()?.focus()?.toggleSuperscript()?.run(),
          ""
        )}
        {renderBtn(
          LuSubscript,
          () => editor?.chain()?.focus()?.toggleSubscript()?.run(),
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
      {/* {renderBtn(RiTeamFill, () => setAddTeamMemberModalOpen(true), "")} */}

      <DocSettingModal
        setDocSettingModalOpen={setDocSettingModalOpen}
        docSettingModalOpen={docSettingModalOpen}
      />
      <AddTeamMemberModal
        addTeamMemberModalOpen={addTeamMemberModalOpen}
        setAddTeamMemberModalOpen={setAddTeamMemberModalOpen}
        selectedTeamMember={selectedTeamMember}
        setSelectedTeamMember={setSelectedTeamMember}
      />
    </div>
  );
}
