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
import { FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";

import { useEffect } from "react";
import TypeBubble from "./TypeBubble";

export default function ContentEditor({
  value,
  onChange,
  autoFocus = true,
  onEditorCreated
}) {
  const editor = useEditor({
    extensions: [
      // 2. StarterKit을 제거하고, 필요한 기능들을 직접 배열에 추가합니다.
      Document,
      Paragraph,
      Heading.configure({ levels: [1, 2, 3] }),
      Text,
      TextStyle,
      FontFamily.configure({
        types: ["textStyle"]
      }),
      FontSize.configure({
        types: ["textStyle"]
      }),
      Bold,
      Italic,
      Strike,
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
    }
  });

  useEffect(() => {
    if (editor && onEditorCreated) {
      onEditorCreated(editor);
    }
  }, [editor, onEditorCreated]);

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
    <div className="relative w-full">
      {editor && <TypeBubble editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
