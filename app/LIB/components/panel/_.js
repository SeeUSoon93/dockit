import { Button } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { MdKeyboardCommandKey } from "react-icons/md";

export default function Statistics({ dragHandleProps }) {
  return (
    <WidgetCard
      icon={MdKeyboardCommandKey}
      title="특수 문자"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10"></div>
    </WidgetCard>
  );
}
