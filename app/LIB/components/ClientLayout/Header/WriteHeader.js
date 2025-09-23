import { Button } from "sud-ui";
import { useEditorContext } from "@/app/LIB/context/EditorContext";
import HomeChildren from "./Children/HomeChildren";

export default function WriteHeader() {
  const { editor } = useEditorContext();

  const renderBtn = (icon, action, extraClass = "") => {
    const Icon = icon;
    return (
      <Button
        colorType="text"
        onClick={() => {
          if (editor && !editor.isDestroyed && editor.isEditable) {
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
