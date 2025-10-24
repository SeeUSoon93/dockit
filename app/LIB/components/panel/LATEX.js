import { Input } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { TbMath } from "react-icons/tb";
import { inputProps } from "../../constant/uiProps";
import { useEditorContext } from "../../context/EditorContext";
import { useState } from "react";

export default function LATEX({ dragHandleProps }) {
  const { editor } = useEditorContext();
  const [latex, setLatex] = useState("");

  const insertLatex = (latex) => {
    if (editor && latex) {
      editor.chain().insertInlineMath({ latex }).focus().run();
      setLatex(""); // 입력 후 필드 초기화
    }
  };

  return (
    <WidgetCard icon={TbMath} title="LATEX" dragHandleProps={dragHandleProps}>
      <div className="w-100 flex flex-col gap-10">
        <Input
          {...inputProps}
          onEnter={() => insertLatex(latex)}
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          placeholder="LATEX 수식 입력 후 Enter"
        />
      </div>
    </WidgetCard>
  );
}
