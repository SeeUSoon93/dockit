import { Button } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { MdKeyboardCommandKey } from "react-icons/md";

export default function SpecialChar({ dragHandleProps }) {
  const keyMap = [
    { key: "·", char: "·" },
    { key: "「", char: "「" },
    { key: "」", char: "」" },
    { key: "『", char: "『" },
    { key: "』", char: "』" },
    { key: "《", char: "《" },
    { key: "》", char: "》" }
  ];

  return (
    <WidgetCard
      icon={MdKeyboardCommandKey}
      title="특수 문자"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        <div className="grid col-7 gap-5">
          {keyMap.map(({ key, char }) => (
            <Button key={key} onClick={() => {}} shadow="none">
              {char}
            </Button>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}
