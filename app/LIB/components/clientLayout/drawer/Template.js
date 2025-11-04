import { Drawer } from "sud-ui";

export default function Template({ open, onClose, title, content }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="400px"
      divider={false}
      title={title}
      placement={title === "폴더" ? "left" : "right"}
    >
      {content}
    </Drawer>
  );
}
