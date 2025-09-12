"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

export default function TitleEditor({
  value,
  onChange,
  placeholder,
  className
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 제목 필드에는 필요 없는 기능들을 비활성화하여 최적화
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        codeBlock: false
      }),
      Placeholder.configure({
        placeholder: placeholder || "내용을 입력하세요.",
        emptyEditorClass: "is-editor-empty"
      })
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getText());
    }
  });

  // 외부 값 ↔ 에디터 내용 동기화
  useEffect(() => {
    // 에디터의 현재 내용과 외부 value가 다를 때만 업데이트
    if (editor && !editor.isDestroyed && value !== editor.getText()) {
      // false를 추가하여 이 변경으로 인해 onUpdate가 다시 실행되는 것을 방지
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  // 👇 메모리 누수 방지를 위한 클린업 함수 추가
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  return <EditorContent editor={editor} className={className} />;
}
