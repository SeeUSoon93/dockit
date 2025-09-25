import WidgetCard from "./WidgetCard";
import { useMemoContext } from "../../context/MemoContext";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import {
  BackgroundColor,
  Color,
  FontFamily,
  FontSize,
  TextStyle,
} from "@tiptap/extension-text-style";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import {
  BulletList,
  ListItem,
  OrderedList,
  TaskItem,
  TaskList,
} from "@tiptap/extension-list";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Indent from "../../extensions/Indent";
import TypeBubble from "../write/TypeBubble";
import { FaNoteSticky } from "react-icons/fa6";

export default function Memo({ dragHandleProps }) {
  const [mounted, setMounted] = useState(false);
  const { memo, setMemo, memoLoading } = useMemoContext();

  // SSR 환경에서 클라이언트에서만 렌더링하기 위한 트릭
  useEffect(() => setMounted(true), []);

  // Tiptap 에디터 설정
  const editor = useEditor({
    extensions: [
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
        nested: true,
      }),
      Highlight.configure({ multicolor: true }),
      Heading.configure({ levels: [1, 2, 3] }),
      Text,
      TextStyle,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      TableKit.configure({
        table: { resizable: true },
      }),
      Color.configure({ types: ["textStyle"] }),
      FontFamily.configure({
        types: ["textStyle"],
      }),
      BackgroundColor.configure({ types: ["textStyle"] }),
      FontSize.configure({
        types: ["textStyle"],
      }),
      Bold,
      Italic,
      Strike,
      Indent,
      Underline,
      Placeholder.configure({
        placeholder: "메모를 남겨보세요.",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: memo?.memo || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const currentHtml = editor.getHTML();
      // MemoContext의 setMemo로 상태 업데이트 (자동저장 포함)
      setMemo({ memo: currentHtml });
    },
  });

  // MemoContext에서 memo가 변경되었을 때 에디터에 반영
  useEffect(() => {
    if (editor && memo?.memo && memo.memo !== editor.getHTML()) {
      editor.commands.setContent(memo.memo);
    }
  }, [memo?.memo, editor]);

  // 에디터 인스턴스 파괴 로직
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!mounted || memoLoading) {
    return (
      <WidgetCard
        icon={FaNoteSticky}
        title="메모"
        dragHandleProps={dragHandleProps}
      >
        <div className="w-100 flex flex-col gap-10">
          <div>로딩 중...</div>
        </div>
      </WidgetCard>
    );
  }

  // JSX 렌더링
  return (
    <WidgetCard
      icon={FaNoteSticky}
      title="메모"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        <div style={{ flex: 1 }}>
          {editor && <TypeBubble editor={editor} />}
          <div>
            <EditorContent editor={editor} className="tiptap" />
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
