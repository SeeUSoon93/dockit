"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import HorizontalRule from "@tiptap/extension-horizontal-rule"; // 페이지 나누기 기능
import { useEffect } from "react";
import TypeBubble from "./TypeBubble";

export default function ContentEditor({ value, onChange, autoFocus = true }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      HorizontalRule, // 페이지 나누기('---')를 위한 확장 기능
      Placeholder.configure({
        placeholder: "내용을 입력하세요...",
        emptyEditorClass: "is-editor-empty"
      })
    ],
    // 1. content prop으로 JSON 객체를 직접 받습니다.
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        // 에디터 영역 기본 스타일
        class:
          "prose prose-sm sm:prose-base focus:outline-none w-full h-full p-2"
      }
    },
    onUpdate: ({ editor }) => {
      // 2. 변경된 내용을 HTML이 아닌 JSON으로 부모에게 전달합니다.
      onChange(editor.getJSON());
    }
  });

  // 3. 외부 value(JSON)와 에디터 내부 content(JSON)를 비교하고 동기화합니다.
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      // JSON.stringify를 사용해 두 객체를 비교하는 것이 가장 확실합니다.
      const editorJSON = JSON.stringify(editor.getJSON());
      const valueJSON = JSON.stringify(value);

      if (valueJSON !== editorJSON) {
        editor.commands.setContent(value, false);
      }
    }
  }, [value, editor]);

  // 자동 포커스 (변경 없음)
  useEffect(() => {
    if (editor && autoFocus) {
      editor.chain().focus("end").run();
    }
  }, [editor, autoFocus]);

  // 에디터 인스턴스 제거 (메모리 누수 방지, 변경 없음)
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  return (
    <div className="relative w-full h-full">
      {editor && <TypeBubble editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
