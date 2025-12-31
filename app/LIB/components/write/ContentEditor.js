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
  bulletStyle,
}) {
  const [isEditable, setIsEditable] = useState(true);
  const { selectedObject, setSelectedObject, setEditor } = useEditorContext();

  // editor 인스턴스를 ref로 저장하여 저장 시점에만 getHTML() 호출
  const editorRef = useRef(null);

  // onChange debounce를 위한 ref
  const onChangeTimeoutRef = useRef(null);
  const lastContentRef = useRef("");

  // debounced onChange - 저장 시점에만 getHTML() 호출
  const debouncedOnChange = useCallback(() => {
    if (onChangeTimeoutRef.current) {
      clearTimeout(onChangeTimeoutRef.current);
    }
    onChangeTimeoutRef.current = setTimeout(() => {
      if (editorRef.current && !editorRef.current.isDestroyed) {
        try {
          const html = editorRef.current.getHTML();
          if (html !== lastContentRef.current) {
            lastContentRef.current = html;
            onChange(html);
          }
        } catch (error) {
          console.error("ContentEditor getHTML error:", error);
        }
      }
    }, 500); // 500ms debounce - 저장 시점에만 호출
  }, [onChange]);

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
      editorRef.current = currentEditor;
    },
    // onUpdate에서 getHTML() 제거 - 저장 시점에만 호출하도록 변경
    onUpdate: () => {
      debouncedOnChange();
    },
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

  // 이전 스타일 해시를 저장하여 변경 시에만 업데이트
  const lastStyleHashRef = useRef("");

  const syncHeadingStyles = useCallback(() => {
    if (!editor) {
      return;
    }

    const { selection, doc } = editor.state;
    const editorElement = editor.view.dom;

    // selection 범위 내에서만 헤딩과 리스트 찾기
    // ProseMirror의 doc.nodesBetween을 사용하여 선택 범위로 제한
    const headingsInRange = [];
    const listItemsInRange = [];

    // 선택 범위를 기준으로 탐색 (뷰포트 근처만)
    const from = Math.max(0, selection.$from.pos - 500);
    const to = Math.min(doc.content.size, selection.$to.pos + 500);

    doc.nodesBetween(from, to, (node, pos) => {
      if (
        node.type.name === "heading" &&
        ["h1", "h2", "h3"].includes(node.type.name)
      ) {
        headingsInRange.push({ node, pos });
      } else if (node.type.name === "listItem") {
        listItemsInRange.push({ node, pos });
      }
    });

    // 간단한 해시 생성 (범위 내 요소 개수로)
    const styleHash = `${headingsInRange.length}-${listItemsInRange.length}`;

    // 변경되지 않았으면 스킵
    if (lastStyleHashRef.current === styleHash) {
      return;
    }
    lastStyleHashRef.current = styleHash;

    // DOM에서 해당 요소들만 찾기 (이미 범위가 제한되어 있음)
    const headings = editorElement.querySelectorAll("h1, h2, h3");
    const listItems = editorElement.querySelectorAll(
      "ul:not([data-type='taskList']) li, ol li"
    );

    let styleElement = document.getElementById("dynamic-heading-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "dynamic-heading-styles";
      document.head.appendChild(styleElement);
    }

    let allStyles = "";

    // 1. 헤딩 개별 처리
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

    // transaction 이벤트는 docChanged가 true일 때만 체크
    const handleTransaction = ({ transaction }) => {
      // 문서가 변경되지 않았으면 스킵
      if (!transaction.docChanged) {
        return;
      }

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
  }, [
    editor,
    setEditor,
    throttledSyncHeadingStyles,
    syncHeadingStyles,
    checkObjectSelection,
  ]);

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
