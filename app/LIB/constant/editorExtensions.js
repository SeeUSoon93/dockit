import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import Heading from "@tiptap/extension-heading";
import {
  BulletList,
  ListItem,
  OrderedList,
  TaskItem,
  TaskList,
} from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table"; // Assuming CustomTable is correctly defined
import TextAlign from "@tiptap/extension-text-align";
import {
  TextStyle,
  Color,
  FontFamily,
  FontSize,
  BackgroundColor,
} from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { UndoRedo } from "@tiptap/extensions";
import Subscript from "@tiptap/extension-subscript";
import { ColumnsExtension } from "@tiptap-extend/columns";
import Math from "@tiptap/extension-mathematics";
import Superscript from "@tiptap/extension-superscript";

import CustomTable from "../extensions/CustomTable";
import Indent from "../extensions/Indent";
import { FormatPainter } from "../extensions/FormatPainter";

const CustomDocument = Document.extend({
  content: `(block | columnBlock)+`,
});

export const editorExtensions = [
  CustomDocument,
  Paragraph,
  Image.configure({ allowBase64: true }),
  Blockquote,
  CodeBlock,
  BulletList,
  OrderedList,
  ListItem,
  TaskList,
  HorizontalRule,
  TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  Heading.configure({ levels: [1, 2, 3] }),
  Text,
  TextStyle,
  TextAlign.configure({
    types: ["heading", "paragraph"],
    defaultAlignment: "left",
  }),
  TableKit.configure({ table: { resizable: true } }),
  Color.configure({ types: ["textStyle"] }),
  FontFamily.configure({ types: ["textStyle"] }),
  BackgroundColor.configure({ types: ["textStyle"] }),
  FontSize.configure({ types: ["textStyle"] }),
  Bold,
  Italic,
  Strike,
  Indent,
  CustomTable,
  Underline,
  Subscript,
  Superscript,
  Placeholder.configure({
    placeholder: "내용을 입력하세요...",
    emptyEditorClass: "is-editor-empty",
  }),
  UndoRedo.configure({
    depth: 100,
    newGroupDelay: 100,
  }),
  FormatPainter,
  Math.configure({
    blockOptions: {
      onClick: (node, pos) => {
        const newCalculation = prompt(
          "Enter new calculation:",
          node.attrs.latex
        );
        if (newCalculation) {
          editor
            .chain()
            .setNodeSelection(pos)
            .updateBlockMath({ latex: newCalculation })
            .focus()
            .run();
        }
      },
    },
    inlineOptions: {
      onClick: (node) => {
        const newCalculation = prompt(
          "Enter new calculation:",
          node.attrs.latex
        );
        if (newCalculation) {
          editor
            .chain()
            .setNodeSelection(node.pos)
            .updateInlineMath({ latex: newCalculation })
            .focus()
            .run();
        }
      },
    },
  }),
  ColumnsExtension,
];
