"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import { UndoRedo } from "@tiptap/extensions";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import {
  BackgroundColor,
  Color,
  FontFamily,
  FontSize,
  TextStyle
} from "@tiptap/extension-text-style";

import { useCallback, useEffect, useMemo } from "react";
import TypeBubble from "./TypeBubble";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import {
  BulletList,
  ListItem,
  OrderedList,
  TaskItem,
  TaskList
} from "@tiptap/extension-list";
import Highlight from "@tiptap/extension-highlight";

import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";
import Indent from "./indent-extension";
import HorizontalRule from "@tiptap/extension-horizontal-rule";

// styleValueMap: ul 심볼과 ol 접미사를 실제 CSS content 값으로 변환
const styleValueMap = {
  disc: '"•"',
  dash: '"-"',
  "circle-outline": '"○"',
  "circle-filled": '"●"',
  "square-outline": '"□"',
  "square-filled": '"■"',
  "diamond-outline": '"◇"',
  "diamond-filled": '"◆"',
  dot: '". "',
  paren: '") "'
};

// [추가] counterStyleMap: 사용자가 정한 value를 실제 CSS counter 타입으로 변환
const counterStyleMap = {
  decimal: "decimal",
  "upper-roman": "upper-roman",
  "lower-roman": "lower-roman",
  "upper-alpha": "upper-alpha",
  "lower-alpha": "lower-alpha",
  korean: "hangul-consonant", // "ㄱ" -> CSS 'hangul-consonant'
  "korean-2": "hangul" // "가" -> CSS 'hangul'
};

const generateCssVariables = (bulletStyle) => {
  const variables = {};

  if (bulletStyle) {
    // [수정] h1, h2, h3 값을 counterStyleMap으로 변환
    variables["--h1-style"] = counterStyleMap[bulletStyle.h1] || "decimal";
    variables["--h2-style"] = counterStyleMap[bulletStyle.h2] || "decimal";
    variables["--h3-style"] = counterStyleMap[bulletStyle.h3] || "decimal";

    // 뎁스별 리스트 스타일 처리 (뎁스 4 이상은 4와 같은 스타일)
    for (let i = 1; i <= 4; i++) {
      const listStyle = bulletStyle[`list-${i}`] || "disc";
      variables[`--list-${i}-content`] = styleValueMap[listStyle] || '"•"';
    }

    // 뎁스별 순서 리스트 스타일 처리 (뎁스 4 이상은 4와 같은 스타일)
    for (let i = 1; i <= 4; i++) {
      const orderListStyle = bulletStyle[`order-list-${i}`] || "decimal-dot";

      const lastDashIndex = orderListStyle.lastIndexOf("-");
      if (lastDashIndex !== -1) {
        const type = orderListStyle.substring(0, lastDashIndex);
        const suffixKey = orderListStyle.substring(lastDashIndex + 1);

        variables[`--order-list-${i}-type`] =
          counterStyleMap[type] || "decimal";
        variables[`--order-list-${i}-suffix`] =
          styleValueMap[suffixKey] || '". "';
      } else {
        variables[`--order-list-${i}-type`] =
          counterStyleMap[orderListStyle] || "decimal";
        variables[`--order-list-${i}-suffix`] = '". "';
      }
    }
  }

  return variables;
};

export default function ContentEditor({
  value,
  onChange,
  autoFocus = true,
  onEditorCreated,
  bulletStyle
}) {
  const editor = useEditor({
    extensions: [
      // 2. StarterKit을 제거하고, 필요한 기능들을 직접 배열에 추가합니다.
      Document,
      Paragraph,
      Blockquote,
      CodeBlock,
      BulletList,
      OrderedList,
      ListItem,
      TaskList,
      HorizontalRule,
      TaskItem.configure({
        nested: true
      }),
      Highlight.configure({ multicolor: true }),
      Heading.configure({ levels: [1, 2, 3] }),
      Text,
      TextStyle,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left"
      }),
      TableKit.configure({
        table: { resizable: true }
      }),
      Color.configure({ types: ["textStyle"] }),
      FontFamily.configure({
        types: ["textStyle"]
      }),
      BackgroundColor.configure({ types: ["textStyle"] }),
      FontSize.configure({
        types: ["textStyle"]
      }),
      Bold,
      Italic,
      Strike,
      Indent,
      Underline,
      Placeholder.configure({
        placeholder: "내용을 입력하세요...",
        emptyEditorClass: "is-editor-empty"
      }),
      UndoRedo.configure({
        depth: 100, // 원하는 만큼의 undo/redo 깊이 설정
        newGroupDelay: 100 // 100ms 동안의 입력은 같은 그룹으로 간주
      })
    ],
    content: value,
    autofocus: autoFocus ? "end" : false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        // 에디터 영역 기본 스타일
        class: "prose prose-sm sm:prose-base focus:outline-none w-full"
      }
    },
    onUpdate: ({ editor }) => {
      // 2. 변경된 내용을 HTML이 아닌 JSON으로 부모에게 전달합니다.
      onChange(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      if (onEditorCreated) {
        onEditorCreated(editor);
      }
    }
  });

  const editorStyleVariables = useMemo(
    () => generateCssVariables(bulletStyle),
    [bulletStyle]
  );
  // 헤딩과 리스트 스타일 동기화 함수 - 성공했던 방식으로 개별 처리
  const syncHeadingStyles = useCallback(() => {
    console.log("🔧 syncHeadingStyles 함수 실행됨");

    if (!editor) {
      console.log("❌ editor가 없음");
      return;
    }

    const editorElement = editor.view.dom;

    // 동적 CSS 생성
    let styleElement = document.getElementById("dynamic-heading-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "dynamic-heading-styles";
      document.head.appendChild(styleElement);
    }

    let allStyles = "";

    // 1. 헤딩 개별 처리 - 성공했던 방식 사용
    const headings = editorElement.querySelectorAll("h1, h2, h3");
    console.log(`📝 찾은 헤딩 개수: ${headings.length}`);

    headings.forEach((heading, index) => {
      const span = heading.querySelector("span");
      if (span) {
        const computedStyle = window.getComputedStyle(span);

        // 각 헤딩별로 전역 스타일 생성 (성공했던 방식)
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

        console.log(
          `✅ 헤딩 ${heading.tagName} (${index + 1}번째) 스타일 적용:`,
          {
            fontSize: computedStyle.fontSize,
            fontFamily: computedStyle.fontFamily
          }
        );
      }
    });

    // 2. 리스트 아이템 개별 처리
    const listItems = editorElement.querySelectorAll(
      "ul:not([data-type='taskList']) li, ol li"
    );
    console.log(`📝 찾은 리스트 아이템 개수: ${listItems.length}`);

    listItems.forEach((li, index) => {
      const span = li.querySelector("span");
      if (span) {
        const computedStyle = window.getComputedStyle(span);

        // 각 리스트별로 전역 스타일 생성
        allStyles += `
.tiptap-container li:nth-of-type(${index + 1})::before {
  font-family: ${computedStyle.fontFamily} !important;
  font-size: ${computedStyle.fontSize} !important;
  font-weight: ${computedStyle.fontWeight} !important;
  color: ${computedStyle.color} !important;
}
        `;

        console.log(`✅ 리스트 아이템 (${index + 1}번째) 스타일 적용:`, {
          fontSize: computedStyle.fontSize,
          fontFamily: computedStyle.fontFamily
        });
      }
    });

    // 스타일 적용 (성공했던 방식 그대로)
    styleElement.textContent = allStyles;
    console.log("✨ 모든 개별 스타일 적용 완료");
  }, [editor]);
  useEffect(() => {
    if (editor) {
      editor.on("update", syncHeadingStyles);
      editor.on("selectionUpdate", syncHeadingStyles);

      // 초기 동기화
      syncHeadingStyles();

      return () => {
        editor.off("update", syncHeadingStyles);
        editor.off("selectionUpdate", syncHeadingStyles);
      };
    }
  }, [editor, syncHeadingStyles]);

  // 3. 외부 value(JSON)와 에디터 내부 content(JSON)를 비교하고 동기화합니다.
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      // JSON.stringify를 사용해 두 객체를 비교하는 것이 가장 확실합니다.
      const editorHTML = editor.getHTML();
      const valueHTML = value;

      if (valueHTML !== editorHTML) {
        editor.commands.setContent(valueHTML, false);
      }
    }
  }, [value, editor]);

  // 에디터 인스턴스 제거 (메모리 누수 방지, 변경 없음)
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
      }
    };
  }, [editor]);

  return (
    <div
      className="relative w-full tiptap-container prose prose-sm sm:prose-base"
      style={editorStyleVariables}
    >
      {editor && <TypeBubble editor={editor} />}
      {editor && <EditorContent editor={editor} />}
    </div>
  );
}
