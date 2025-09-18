import { inputProps } from "@/app/LIB/constant/uiProps";
import { Button, Input } from "sud-ui";

export default function ImageEditor({
  updateImageAttr,
  width,
  height,
  setWidth,
  setHeight,
  selectedObject
}) {
  return (
    <>
      <img
        src={selectedObject?.node?.attrs?.src}
        alt="Selected"
        style={{ maxWidth: "50%" }}
      />
      <div className="flex items-center gap-5">
        <Input
          {...inputProps}
          value={width}
          onChange={(e) => {
            setWidth(e.target.value);
          }}
          style={{ width: 60 }}
        />
        X
        <Input
          {...inputProps}
          value={height}
          onChange={(e) => {
            setHeight(e.target.value);
          }}
          style={{ width: 60 }}
        />
      </div>
      <Button
        size="sm"
        background="mint"
        color="mint-1"
        onClick={() => {
          updateImageAttr("width", width);
          updateImageAttr("height", height);
        }}
      >
        확인
      </Button>
    </>
  );
}
