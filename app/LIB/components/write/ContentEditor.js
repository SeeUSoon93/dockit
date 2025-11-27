"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEditorContext } from "../../context/EditorContext";
import { generateCssVariables } from "../../utils/tiptapUtils";
import { useCallback, useEffect, useMemo, useState } from "react";

import TypeBubble from "./TypeBubble";
import { migrateMathStrings } from "@tiptap/extension-mathematics";
import { editorExtensions } from "@/app/LIB/constant/editorExtensions";

export default function ContentEditor({
  value,
  onChange,
  autoFocus = true,
  bulletStyle,
}) {
  const [isEditable, setIsEditable] = useState(true);
  const { selectedObject, setSelectedObject, setEditor } = useEditorContext();

  const editor = useEditor({
    extensions: editorExtensions,
    content: value,
    autofocus: autoFocus ? "end" : false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base focus:outline-none w-full",
      },
    },
    onCreate: ({ editor: currentEditor }) => {
      migrateMathStrings(currentEditor);
    },
    onUpdate: ({ editor }) => {
      try {
        onChange(editor.getHTML());
      } catch (error) {
        console.error("ContentEditor onUpdate error:", error);
      }
    },
  });

  const editorStyleVariables = useMemo(
    () => generateCssVariables(bulletStyle),
    [bulletStyle]
  );

  const checkObjectSelection = useCallback(() => {
    if (!editor) return;
    const { selection } = editor.state;
    if (selection.node && selection.node.type.name === "image") {
      setSelectedObject(selection);
    } else {
      let isInTable = false;
      let tableInfo = null;
      for (let depth = selection.$from.depth; depth > 0; depth--) {
        const node = selection.$from.node(depth);
        if (node.type.name === "table") {
          isInTable = true;
          const pos = selection.$from.before(depth);
          tableInfo = {
            node: node,
            from: pos,
            to: pos + node.nodeSize,
            type: "table",
          };
          break;
        }
      }
      if (isInTable && tableInfo) {
        setSelectedObject(tableInfo);
      } else {
        setSelectedObject(null);
      }
    }
  }, [editor, setSelectedObject]);

  const syncHeadingStyles = useCallback(() => {
    if (!editor) {
      return;
    }
    const editorElement = editor.view.dom;

    let styleElement = document.getElementById("dynamic-heading-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "dynamic-heading-styles";
      document.head.appendChild(styleElement);
    }

    let allStyles = "";

    // 1. 헤딩 개별 처리 - 성공했던 방식 사용
    const headings = editorElement.querySelectorAll("h1, h2, h3");

    headings.forEach((heading, index) => {
      const span = heading.querySelector("span");
      if (span) {
        const computedStyle = window.getComputedStyle(span);

        // 각 헤딩별로 전역 스타일 생성
        allStyles += `
.tiptap-container ${heading.tagName.toLowerCase()}:nth-of-type(${
          index + 1
        })::before {
  font-family: ${computedStyle.fontFamily} !important;
  font-size: ${computedStyle.fontSize} !important;
  font-weight: ${computedStyle.fontWeight} !important;
  color: ${computedStyle.color} !important;
}
        `;
      }
    });

    const listItems = editorElement.querySelectorAll(
      "ul:not([data-type='taskList']) li, ol li"
    );

    listItems.forEach((li, index) => {
      const span = li.querySelector("span");
      if (span) {
        const computedStyle = window.getComputedStyle(span);

        allStyles += `
.tiptap-container li:nth-of-type(${index + 1})::before {
  font-family: ${computedStyle.fontFamily} !important;
  font-size: ${computedStyle.fontSize} !important;
  font-weight: ${computedStyle.fontWeight} !important;
  color: ${computedStyle.color} !important;
}
        `;
      }
    });

    styleElement.textContent = allStyles;
  }, [editor]);

  // ✨ 통합된 에디터 생명주기 관리
  useEffect(() => {
    if (!editor) return;

    // 1. Context에 에디터 인스턴스 등록
    setEditor(editor);

    // 2. 이벤트 리스너 등록
    editor.on("update", syncHeadingStyles);
    editor.on("selectionUpdate", syncHeadingStyles);
    editor.on("selectionUpdate", checkObjectSelection);
    editor.on("transaction", checkObjectSelection);

    // 3. 초기 상태 동기화
    syncHeadingStyles();
    checkObjectSelection();

    // 4. Cleanup: 모든 리스너 제거 및 에디터 파괴
    return () => {
      setEditor(null);
      editor.off("update", syncHeadingStyles);
      editor.off("selectionUpdate", syncHeadingStyles);
      editor.off("selectionUpdate", checkObjectSelection);
      editor.off("transaction", checkObjectSelection);

      if (!editor.isDestroyed) {
        editor.destroy();
      }
    };
  }, [editor, setEditor, syncHeadingStyles, checkObjectSelection]);

  // ✨ isEditable 상태 변경 시 즉시 반영
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  // ✨ 외부 value 변경 시 즉시 동기화
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const editorHTML = editor.getHTML();
      if (value !== editorHTML) {
        editor.commands.setContent(value, false);
      }
    }
  }, [value, editor]);

  return (
    <div
      className="relative w-full tiptap-container prose prose-sm sm:prose-base printable-area"
      style={editorStyleVariables}
    >
      {editor && !selectedObject && <TypeBubble editor={editor} />}
      {editor && <EditorContent editor={editor} />}
    </div>
  );
}
