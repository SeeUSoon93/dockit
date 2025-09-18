import { Extension } from "@tiptap/core";

const Indent = Extension.create({
  name: "indent",

  addOptions() {
    return {
      types: [
        "paragraph",
        "heading",
        "blockquote",
        "listItem",
        "table",
        "taskItem"
      ],
      indentLevels: [0, 16, 32, 48, 64, 80, 96, 112, 128]
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            renderHTML: (attributes) => {
              if (attributes.indent === 0) {
                return {};
              }
              // 리스트 아이템과 일반 요소 구분해서 처리
              return {
                "data-indent": attributes.indent
              };
            },
            parseHTML: (element) => {
              // data-indent 속성에서 먼저 값을 읽어오고, 없으면 스타일에서 추출
              const dataIndent = element.getAttribute("data-indent");
              if (dataIndent) {
                return parseInt(dataIndent, 10);
              }

              const paddingLeft = parseInt(element.style.paddingLeft, 10);
              const marginLeft = parseInt(element.style.marginLeft, 10);
              return paddingLeft || marginLeft || 0;
            }
          }
        }
      }
    ];
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      "Shift-Tab": () => this.editor.commands.outdent()
    };
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ tr, dispatch }) => {
          const { selection } = tr;
          const { from, to } = selection;

          tr.doc.nodesBetween(from, to, (node, pos) => {
            console.log(
              "Node type:",
              node.type.name,
              "Parent:",
              tr.doc.resolve(pos).parent.type.name
            );

            if (this.options.types.includes(node.type.name)) {
              // 리스트 아이템의 자식 요소는 완전히 제외
              const $pos = tr.doc.resolve(pos);
              const parentNode = $pos.parent;

              // Task List 특별 처리: taskItem 내부의 paragraph에 indent 적용하되, CSS에서 전체 li를 이동
              if (node.type.name === "taskItem") {
                console.log("taskItem 건너뛰기 - paragraph에서 처리");
                // taskItem 자체는 건너뛰고, 내부 paragraph에서 처리
                return;
              } else if (
                parentNode.type.name === "taskItem" &&
                node.type.name === "paragraph"
              ) {
                console.log("taskItem 내부의 paragraph에 indent 적용");
                // Task List의 paragraph에 indent 적용 (CSS에서 전체 li 이동)
              } else if (
                parentNode.type.name === "listItem" &&
                node.type.name !== "listItem"
              ) {
                console.log("일반 리스트의 자식 요소 건너뛰기");
                // 일반 리스트의 자식 요소는 들여쓰기 안함
                return;
              }

              const currentIndent = node.attrs.indent || 0;
              const newIndent =
                this.options.indentLevels.find(
                  (level) => level > currentIndent
                ) || currentIndent;

              if (newIndent !== currentIndent) {
                console.log(
                  "Indent 적용:",
                  node.type.name,
                  currentIndent,
                  "->",
                  newIndent
                );
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent: newIndent
                });
              }
            }
          });

          if (tr.docChanged) {
            dispatch?.(tr);
            return true;
          }
          return false;
        },
      outdent:
        () =>
        ({ tr, dispatch }) => {
          const { selection } = tr;
          const { from, to } = selection;

          tr.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              // 리스트 아이템의 자식 요소는 완전히 제외
              const $pos = tr.doc.resolve(pos);
              const parentNode = $pos.parent;

              // Task List 특별 처리: taskItem 내부의 paragraph에 indent 적용하되, CSS에서 전체 li를 이동
              if (node.type.name === "taskItem") {
                // taskItem 자체는 건너뛰고, 내부 paragraph에서 처리
                return;
              } else if (
                parentNode.type.name === "taskItem" &&
                node.type.name === "paragraph"
              ) {
                // Task List의 paragraph에 indent 적용 (CSS에서 전체 li 이동)
              } else if (
                parentNode.type.name === "listItem" &&
                node.type.name !== "listItem"
              ) {
                // 일반 리스트의 자식 요소는 들여쓰기 안함
                return;
              }

              const currentIndent = node.attrs.indent || 0;
              const newIndent =
                [...this.options.indentLevels]
                  .reverse()
                  .find((level) => level < currentIndent) ?? 0;

              if (newIndent !== currentIndent) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent: newIndent
                });
              }
            }
          });

          if (tr.docChanged) {
            dispatch?.(tr);
            return true;
          }
          return false;
        }
    };
  }
});

export default Indent;
