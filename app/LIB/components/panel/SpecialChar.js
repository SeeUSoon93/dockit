import { Button, Card, Divider, Input, Typography } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { MdAdd, MdKeyboardCommandKey } from "react-icons/md";
import { useEditorContext } from "@/app/LIB/context/EditorContext";
import { useCharContext } from "@/app/LIB/context/CharContext";
import { inputProps } from "../../constant/uiProps";
import { useState } from "react";
import { SettingOutline } from "sud-icons";

export default function SpecialChar({ dragHandleProps }) {
  const { editor } = useEditorContext();
  const { char, setChar, charLoading } = useCharContext();
  const [newChar, setNewChar] = useState("");
  const [isSettingMode, setIsSettingMode] = useState(false);

  const insertSpecialChar = (char) => {
    if (editor) {
      editor.chain().focus().insertContent(char).run();
    }
  };

  const addNewChar = () => {
    if (newChar.length === 1) {
      // 이미 존재하는 특수문자인지 확인
      if (char.char.some((item) => item.key === newChar)) {
        return;
      }
      setChar({
        ...char,
        char: [...char.char, { key: newChar, char: newChar }],
      });
      setNewChar("");
    }
  };

  const deleteChar = (charKey) => {
    setChar({
      ...char,
      char: char.char.filter((item) => item.key !== charKey),
    });
  };

  return (
    <WidgetCard
      icon={MdKeyboardCommandKey}
      title="특수 문자"
      dragHandleProps={dragHandleProps}
      titleBtn={
        <Button
          icon={<SettingOutline size={14} />}
          shadow="none"
          border={false}
          onClick={() => setIsSettingMode(!isSettingMode)}
        />
      }
    >
      <div className="w-100 flex flex-col gap-10">
        <div className="grid col-7 gap-5">
          {!charLoading &&
            char?.char?.length > 0 &&
            char.char.map(({ key, char }) => (
              <div key={key} className="flex  jus-cen item-cen w-100 relative">
                <Button
                  size="sm"
                  onClick={() =>
                    isSettingMode ? deleteChar(char) : insertSpecialChar(char)
                  }
                  shadow="none"
                  aria-label={`특수문자 ${char} 삽입`}
                  role="button"
                  tabIndex={0}
                  style={{ width: "100%" }}
                  background={isSettingMode && "neutral-3"}
                >
                  {char}
                </Button>
              </div>
            ))}
        </div>
        {isSettingMode && (
          <Typography size="sm" color="volcano" pretendard="B">
            ※ 버튼을 클릭하면 특수문자를 삭제할 수 있습니다.
          </Typography>
        )}
        {isSettingMode && <Divider style={{ margin: 0 }} />}
        {isSettingMode && (
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "1fr 40px" }}
          >
            <Input
              {...inputProps}
              value={newChar}
              onChange={(e) => setNewChar(e.target.value)}
              length={1}
              maxLength={1}
              minLength={1}
            />
            <Button
              size="sm"
              onClick={addNewChar}
              shadow="none"
              aria-label="특수문자 추가"
              role="button"
              disabled={newChar.length !== 1}
            >
              <MdAdd />
            </Button>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
