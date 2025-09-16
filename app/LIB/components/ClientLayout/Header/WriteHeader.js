import { Button, Tabs } from "sud-ui";
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

  const options = [
    {
      key: "home",
      label: "홈",
      children: <HomeChildren renderBtn={renderBtn} editor={editor} />
    },
    {
      key: "components",
      label: "삽입",
      children: <div>Components Content</div>
    },
    {
      key: "css",
      label: "레이아웃",
      children: <div>CSS Content</div>
    }
  ];

  return (
    <div>
      <Tabs size="sm" options={options} />
    </div>
  );
}
