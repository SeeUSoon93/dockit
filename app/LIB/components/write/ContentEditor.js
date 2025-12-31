"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEditorContext } from "../../context/EditorContext";
import { generateCssVariables } from "../../utils/tiptapUtils";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import TypeBubble from "./TypeBubble";
import { migrateMathStrings } from "@tiptap/extension-mathematics";
import { editorExtensions } from "@/app/LIB/constant/editorExtensions";
import { useThrottle } from "../../hook/useThrottle";

export default function ContentEditor({
  value,
  onChange,
  autoFocus = true,
  bulletStyle
}) {
  const [isEditable, setIsEditable] = useState(true);
  const { selectedObject, setSelectedObject, setEditor } = useEditorContext();

  // onChange debounce를 위한 ref
  const onChangeTimeoutRef = useRef(null);
  const lastContentRef = useRef("");

  // debounced onChange
  const debouncedOnChange = useCallback(
    (html) => {
      if (onChangeTimeoutRef.current) {
        clearTimeout(onChangeTimeoutRef.current);
      }
      onChangeTimeoutRef.current = setTimeout(() => {
        if (html !== lastContentRef.current) {
          lastContentRef.current = html;
          onChange(html);
        }
      }, 300); // 300ms debounce
    },
    [onChange]
  );

  const editor = useEditor({
    extensions: editorExtensions,
    content: value,
    autofocus: autoFocus ? "end" : false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base focus:outline-none w-full"
      }
    },
    onCreate: ({ editor: currentEditor }) => {
      migrateMathStrings(currentEditor);
    },
    onUpdate: ({ editor }) => {
      try {
        const html = editor.getHTML();
        debouncedOnChange(html);
      } catch (error) {
        console.error("ContentEditor onUpdate error:", error);
      }
    }
  });

  const editorStyleVariables = useMemo(
    () => generateCssVariables(bulletStyle),
    [bulletStyle]
  );

  // 이전 선택 상태를 저장하여 불필요한 업데이트 방지
  const lastSelectionRef = useRef(null);

  const checkObjectSelection = useCallback(() => {
    if (!editor) return;
    const { selection } = editor.state;
    
    // 선택이 변경되지 않았으면 스킵
    const selectionKey = `${selection.$from.pos}-${selection.$to.pos}`;
    if (lastSelectionRef.current === selectionKey) {
      return;
    }
    lastSelectionRef.current = selectionKey;

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
            type: "table"
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

  // 이전 스타일 해시를 저장하여 변경 시에만 업데이트
  const lastStyleHashRef = useRef("");

  const syncHeadingStyles = useCallback(() => {
    if (!editor) {
      return;
    }
    const editorElement = editor.view.dom;

    // 헤딩과 리스트가 실제로 변경되었는지 확인
    const headings = editorElement.querySelectorAll("h1, h2, h3");
    const listItems = editorElement.querySelectorAll(
      "ul:not([data-type='taskList']) li, ol li"
    );
    
    // 간단한 해시 생성 (요소 개수와 첫 번째 요소의 텍스트로)
    const styleHash = `${headings.length}-${listItems.length}-${
      headings[0]?.textContent?.slice(0, 10) || ""
    }-${listItems[0]?.textContent?.slice(0, 10) || ""}`;
    
    // 변경되지 않았으면 스킵
    if (lastStyleHashRef.current === styleHash) {
      return;
    }
    lastStyleHashRef.current = styleHash;

    let styleElement = document.getElementById("dynamic-heading-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "dynamic-heading-styles";
      document.head.appendChild(styleElement);
    }

    let allStyles = "";

    // 1. 헤딩 개별 처리 - 성공했던 방식 사용
    ["h1", "h2", "h3"].forEach((tagName) => {
      const tagHeadings = editorElement.querySelectorAll(tagName);

      tagHeadings.forEach((heading, index) => {
        const span = heading.querySelector("span");
        if (span) {
          const computedStyle = window.getComputedStyle(span);

          allStyles += `
            .tiptap-container ${tagName}:nth-of-type(${index + 1})::before {
              font-family: ${computedStyle.fontFamily} !important;
              font-size: ${computedStyle.fontSize} !important;
              font-weight: ${computedStyle.fontWeight} !important;
              color: ${computedStyle.color} !important;
            }
          `;
        }
      });
    });

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

  // throttle된 syncHeadingStyles
  const throttledSyncHeadingStyles = useThrottle(syncHeadingStyles, 200);

  // ✨ 통합된 에디터 생명주기 관리
  useEffect(() => {
    if (!editor) return;

    // 1. Context에 에디터 인스턴스 등록
    setEditor(editor);

    // 2. 이벤트 리스너 등록
    // - update: throttle 적용하여 자주 실행되지 않도록
    // - selectionUpdate: throttle 적용
    // - transaction: 이미지 관련이 아닐 때만 실행
    editor.on("update", throttledSyncHeadingStyles);
    editor.on("selectionUpdate", throttledSyncHeadingStyles);
    editor.on("selectionUpdate", checkObjectSelection);
    
    // transaction 이벤트는 이미지 관련이 아닐 때만 체크
    const handleTransaction = () => {
      const { selection } = editor.state;
      // 이미지 노드가 아니고, 이미지 내부가 아닐 때만 체크
      if (selection.node?.type.name !== "image") {
        checkObjectSelection();
      }
    };
    editor.on("transaction", handleTransaction);

    // 3. 초기 상태 동기화
    syncHeadingStyles();
    checkObjectSelection();

    // 4. Cleanup: 모든 리스너 제거 및 에디터 파괴
    return () => {
      setEditor(null);
      editor.off("update", throttledSyncHeadingStyles);
      editor.off("selectionUpdate", throttledSyncHeadingStyles);
      editor.off("selectionUpdate", checkObjectSelection);
      editor.off("transaction", handleTransaction);
      
      // debounce timeout 정리
      if (onChangeTimeoutRef.current) {
        clearTimeout(onChangeTimeoutRef.current);
      }

      if (!editor.isDestroyed) {
        editor.destroy();
      }
    };
  }, [editor, setEditor, throttledSyncHeadingStyles, syncHeadingStyles, checkObjectSelection]);

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
