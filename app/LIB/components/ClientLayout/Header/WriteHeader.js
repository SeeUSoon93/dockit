import { Button, Divider, Tabs } from "sud-ui";
import { useEditorContext } from "@/app/LIB/context/EditorContext";
import HomeChildren from "./Children/HomeChildren";

export default function WriteHeader() {
  const { editor } = useEditorContext();

  const renderBtn = (icon, action, extraClass = "") => {
    const Icon = icon;
    return (
      <Button
        colorType="text"
        // onClick 핸들러를 수정합니다.
        onClick={() => {
          // editor가 존재하고, '편집 가능한' 상태일 때만 action을 실행합니다.
          if (editor && editor.isEditable) {
            action();
          }
        }}
        className={`cursor-pointer ${extraClass}`}
        icon={<Icon size={16} />}
        style={{ padding: "4px" }}
      />
    );
  };

  return (
    editor && (
      <div className="pd-10 overflow-x-auto">
        <HomeChildren renderBtn={renderBtn} />
      </div>
    )
  );
}
