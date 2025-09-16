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
        onClick={action}
        className={`cursor-pointer ${extraClass}`}
        icon={<Icon size={16} />}
        style={{ padding: "4px" }}
      />
    );
  };

  return (
    <div className="pd-10">
      <HomeChildren renderBtn={renderBtn} editor={editor} />
    </div>
  );
}
