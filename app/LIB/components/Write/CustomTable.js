import { Extension } from "@tiptap/core";

const CustomTable = Extension.create({
  name: "customTable",

  addOptions() {
    return {
      types: ["table", "tableRow", "tableHeader", "tableCell"]
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ["table"],
        attributes: {
          headerColor: {
            default: null,
            renderHTML: (attributes) => {
              if (!attributes.headerColor) return {};
              return {
                "data-header-color": attributes.headerColor
              };
            },
            parseHTML: (element) => element.getAttribute("data-header-color")
          },
          borderColor: {
            default: null,
            renderHTML: (attributes) => {
              if (!attributes.borderColor) return {};
              return {
                "data-border-color": attributes.borderColor
              };
            },
            parseHTML: (element) => element.getAttribute("data-border-color")
          }
        }
      }
    ];
  },

  addCommands() {
    return {
      setHeaderColor:
        (color) =>
        ({ tr, dispatch, editor }) => {
          console.log("setHeaderColor 호출됨:", color);
          const { selection } = tr;
          const { from, to } = selection;

          let tablePos = null;
          tr.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === "table" && !tablePos) {
              tablePos = pos;
              return false;
            }
          });

          if (tablePos !== null) {
            const tableNode = tr.doc.nodeAt(tablePos);
            tr.setNodeMarkup(tablePos, undefined, {
              ...tableNode.attrs,
              headerColor: color
            });

            // DOM 직접 조작으로 즉시 적용
            setTimeout(() => {
              const tableElement = editor.view.dom.querySelector(
                `table[data-header-color="${color}"]`
              );
              if (tableElement) {
                const headers = tableElement.querySelectorAll("th");
                headers.forEach((th) => {
                  th.style.backgroundColor = color;
                });
              }
            }, 0);
          }

          if (dispatch) {
            dispatch(tr);
          }
          return true;
        },
      setBorderColor:
        (color) =>
        ({ tr, dispatch, editor }) => {
          console.log("setBorderColor 호출됨:", color);
          const { selection } = tr;
          const { from, to } = selection;

          let tablePos = null;
          tr.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === "table" && !tablePos) {
              tablePos = pos;
              return false;
            }
          });

          if (tablePos !== null) {
            const tableNode = tr.doc.nodeAt(tablePos);
            tr.setNodeMarkup(tablePos, undefined, {
              ...tableNode.attrs,
              borderColor: color
            });

            // DOM 직접 조작으로 즉시 적용
            setTimeout(() => {
              const tableElement = editor.view.dom.querySelector(
                `table[data-border-color="${color}"]`
              );
              if (tableElement) {
                const cells = tableElement.querySelectorAll("th, td");
                cells.forEach((cell) => {
                  cell.style.borderColor = color;
                });
              }
            }, 0);
          }

          if (dispatch) {
            dispatch(tr);
          }
          return true;
        }
    };
  }
});

export default CustomTable;
