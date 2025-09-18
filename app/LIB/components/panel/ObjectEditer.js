import WidgetCard from "./WidgetCard";
import { TbEdit } from "react-icons/tb";
import { useEditorContext } from "../../context/EditorContext";
import { Typography } from "sud-ui";

import React from "react";
import ImageEditor from "./EditorComponent/ImageEditor";
import TableEditor from "./EditorComponent/TableEditor";

export default function ObjectEditer({ dragHandleProps }) {
  const { selectedObject, editor } = useEditorContext();

  // ■■■■■■■■■■■ 이미지 변경 ■■■■■■■■■■■
  // 선택 객체가 바뀌면 input 값도 동기화
  const [width, setWidth] = React.useState(
    selectedObject?.node?.attrs?.width || ""
  );
  const [height, setHeight] = React.useState(
    selectedObject?.node?.attrs?.height || "auto"
  );
  React.useEffect(() => {
    if (selectedObject && selectedObject.node.type.name === "image") {
      setWidth(selectedObject.node.attrs.width || "");
      setHeight(selectedObject.node.attrs.height || "auto");
    }
  }, [selectedObject]);
  // 에디터 변경사항을 감지해서 input 값도 업데이트
  React.useEffect(() => {
    if (!editor) return;

    const updateInputs = () => {
      if (selectedObject && selectedObject.node.type.name === "image") {
        const { from } = selectedObject;
        const node = editor.state.doc.nodeAt(from);
        if (node && node.type.name === "image") {
          setWidth(node.attrs.width || "");
          setHeight(node.attrs.height || "auto");
        }
      }
    };

    editor.on("transaction", updateInputs);

    return () => {
      editor.off("transaction", updateInputs);
    };
  }, [editor, selectedObject]);

  // 이미지 속성 변경 함수 - 다른 방법으로 시도
  const updateImageAttr = (attr, value) => {
    if (!editor || !selectedObject || selectedObject.node.type.name !== "image")
      return;

    const { from, to } = selectedObject;

    // 먼저 이미지를 선택하고 updateAttributes 사용
    editor
      .chain()
      .focus()
      .setNodeSelection(from)
      .updateAttributes("image", {
        [attr]: value === "" ? undefined : value
      })
      .run();
  };
  // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■

  return (
    <WidgetCard icon={TbEdit} title="편집기" dragHandleProps={dragHandleProps}>
      <div className="w-100 flex flex-col gap-10">
        <div className="flex jus-bet">
          {selectedObject ? (
            <div className="flex flex-col gap-10 items-center w-100">
              {selectedObject.node.type.name === "image" && (
                <>
                  <Typography>선택된 이미지</Typography>
                  <ImageEditor
                    updateImageAttr={updateImageAttr}
                    width={width}
                    height={height}
                    setWidth={setWidth}
                    setHeight={setHeight}
                    selectedObject={selectedObject}
                  />
                </>
              )}
              {selectedObject.node.type.name === "table" && (
                <TableEditor editor={editor} selectedObject={selectedObject} />
              )}
            </div>
          ) : (
            <Typography color={"cool-gray-7"}>
              편집할 객체를 선택하세요.
            </Typography>
          )}
        </div>
      </div>
    </WidgetCard>
  );
}
