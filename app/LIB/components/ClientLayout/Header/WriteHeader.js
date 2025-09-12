import { Tabs } from "sud-ui";

export default function WriteHeader() {
  const options = [
    {
      key: "home",
      label: "홈",
      children: <div>Home Content</div>
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
