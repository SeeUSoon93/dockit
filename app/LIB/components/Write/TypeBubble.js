import { BubbleMenu } from "@tiptap/react/menus";
import { Button, Div } from "sud-ui";

import {
  PiTextBBold,
  PiTextHOneBold,
  PiTextHThreeBold,
  PiTextHTwoBold,
  PiTextItalicBold,
  PiTextStrikethroughBold,
  PiTextUnderlineBold
} from "react-icons/pi";
import { useMemo } from "react";

export default function TypeBubble({ editor }) {
  const renderBtn = (label, action, isActive, extraClass = "") => (
    <Button
      colorType="text"
      background={isActive && "mint-2"}
      onClick={action}
      className={`bubble-font ${isActive ? "is-active" : ""} ${extraClass}`}
      icon={label}
    />
  );

  const btnConfigs = useMemo(
    () => [
      {
        label: <PiTextBBold size={20} />,
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive("bold"),
        extraClass: "font-bold",
        name: "bold"
      },
      {
        label: <PiTextItalicBold size={20} />,
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive("italic"),
        extraClass: "italic",
        name: "italic"
      },
      {
        label: <PiTextStrikethroughBold size={20} />,
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: editor.isActive("strike"),
        extraClass: "line-through",
        name: "strike"
      },
      {
        label: <PiTextUnderlineBold size={20} />,
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: editor.isActive("underline"),
        extraClass: "underline",
        name: "underline"
      },
      {
        label: <PiTextHOneBold size={20} />,
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: editor.isActive("heading", { level: 1 }),
        extraClass: "font-bold",
        name: "h1"
      },
      {
        label: <PiTextHTwoBold size={20} />,
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive("heading", { level: 2 }),
        extraClass: "font-bold",
        name: "h2"
      },
      {
        label: <PiTextHThreeBold size={20} />,
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: editor.isActive("heading", { level: 3 }),
        extraClass: "font-bold",
        name: "h3"
      }
    ],
    [editor]
  );

  return (
    <BubbleMenu
      editor={editor}
      tippyoptions={{ duration: 100, placement: "top", offset: [0, 8] }}
    >
      <Div
        className="flex shadow-md rad-px-15 rad-15 pd-x-5 pd-y-2"
        background="white-10"
      >
        {btnConfigs.map((btn) => (
          <div key={btn.name}>
            {renderBtn(btn.label, btn.action, btn.isActive, btn.extraClass)}
          </div>
        ))}
      </Div>
    </BubbleMenu>
  );
}
