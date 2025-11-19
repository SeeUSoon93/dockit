import { Button } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { MdKeyboardCommandKey } from "react-icons/md";
import { useEditorContext } from "@/app/LIB/context/EditorContext";
import { useCharContext } from "@/app/LIB/context/CharContext";

export default function SpecialChar({ dragHandleProps }) {
  const { editor } = useEditorContext();
  const { char, setChar, saveChar, charLoading } = useCharContext();

  const insertSpecialChar = (char) => {
    if (editor) {
      editor.chain().focus().insertContent(char).run();
    }
  };

  console.log(char);

  return (
    <WidgetCard
      icon={MdKeyboardCommandKey}
      title="특수 문자"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        <div className="grid col-7 gap-5">
          {char.length > 0 &&
            char.map(({ key, char }) => (
              <Button
                key={key}
                size="sm"
                onClick={() => insertSpecialChar(char)}
                shadow="none"
                aria-label={`특수문자 ${char} 삽입`}
                role="button"
                tabIndex={0}
              >
                {char}
              </Button>
            ))}
        </div>
      </div>
    </WidgetCard>
  );
}
