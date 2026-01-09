import {
  TbColumnInsertLeft,
  TbColumnInsertRight,
  TbColumnRemove,
  TbColumns3,
  TbFreezeColumn,
  TbFreezeRow,
  TbRowInsertBottom,
  TbRowInsertTop,
  TbRowRemove,
} from "react-icons/tb";
import { LuTable2, LuTableCellsMerge, LuTableCellsSplit } from "react-icons/lu";
import { Button, Card, ColorPicker, Typography } from "sud-ui";
import { MdOutlineTableRows } from "react-icons/md";
import { PiRectangleDuotone } from "react-icons/pi";
import { RiColorFilterAiFill } from "react-icons/ri";
import { CgColorBucket } from "react-icons/cg";
import React from "react";

export default function TableEditor({ editor, selectedObject }) {
  // ■■■■■■■■■■■ 버튼 설정 ■■■■■■■■■■■■■
  const renderBtn = (icon, onClick) => {
    const Icon = icon;
    return (
      <Button
        key={icon}
        onClick={onClick}
        size="sm"
        icon={<Icon size={20} />}
      />
    );
  };

  const columnBtnList = [
    {
      icon: TbColumnInsertLeft,
      tooltip: "왼쪽에 열 추가",
      onClick: () => editor.chain().focus().addColumnBefore().run(),
    },
    {
      icon: TbColumnInsertRight,
      tooltip: "오른쪽에 열 추가",
      onClick: () => editor.chain().focus().addColumnAfter().run(),
    },
    {
      icon: TbColumnRemove,
      tooltip: "열 삭제",
      onClick: () => editor.chain().focus().deleteColumn().run(),
    },
    {
      icon: TbFreezeColumn,
      tooltip: "열 제목 토글",
      onClick: () => editor.chain().focus().toggleHeaderColumn().run(),
    },
  ];

  const rowBtnList = [
    {
      icon: TbRowInsertBottom,
      tooltip: "아래에 행 추가",
      onClick: () => editor.chain().focus().addRowAfter().run(),
    },
    {
      icon: TbRowInsertTop,
      tooltip: "위에 행 추가",
      onClick: () => editor.chain().focus().addRowBefore().run(),
    },
    {
      icon: TbRowRemove,
      tooltip: "행 삭제",
      onClick: () => editor.chain().focus().deleteRow().run(),
    },
    {
      icon: TbFreezeRow,
      tooltip: "행 제목 토글",
      onClick: () => editor.chain().focus().toggleHeaderRow().run(),
    },
  ];

  const cellBtnList = [
    {
      icon: LuTableCellsMerge,
      tooltip: "셀 병합",
      onClick: () => editor.chain().focus().mergeCells().run(),
    },
    {
      icon: LuTableCellsSplit,
      tooltip: "셀 나누기",
      onClick: () => editor.chain().focus().splitCell().run(),
    },
    {
      icon: LuTable2,
      tooltip: "셀 헤더 토글",
      onClick: () => editor.chain().focus().toggleHeaderCell().run(),
    },
  ];
  // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  // ■■■■■■■■■■■ 스타일 ■■■■■■■■■■■■■■■■■■
  const [headerColorPickerOpen, setHeaderColorPickerOpen] =
    React.useState(false);
  const [borderColorPickerOpen, setBorderColorPickerOpen] =
    React.useState(false);

  // const handleBorderColorChange = (color) => {
  //   setBorderColor(color);
  //   if (editor) {
  //     editor.chain().focus().setCellAttribute('borderColor', color).run();
  //   }
  // };

  return (
    <div className="w-100 flex flex-col gap-10">
      {/* 컬럼 */}
      <div className="flex flex-col gap-5">
        <Typography
          as="div"
          className="flex gap-3 items-center"
          size="sm"
          pretendard="B"
        >
          <TbColumns3 />
          열(Column) 편집
        </Typography>
        <Card shadow="none" width="100%">
          <div className="grid col-4 gap-10">
            {columnBtnList.map(({ icon, onClick }, index) =>
              renderBtn(icon, onClick)
            )}
          </div>
        </Card>
      </div>
      {/* 행 */}
      <div className="flex flex-col gap-5">
        <Typography
          as="div"
          className="flex gap-3 items-center"
          size="sm"
          pretendard="B"
        >
          <MdOutlineTableRows />
          행(Row) 편집
        </Typography>
        <Card shadow="none" width="100%">
          <div className="grid col-4 gap-10">
            {rowBtnList.map(({ icon, onClick }, index) =>
              renderBtn(icon, onClick)
            )}
          </div>
        </Card>
      </div>
      {/* 셀 */}
      <div className="flex flex-col gap-5">
        <Typography
          as="div"
          className="flex gap-3 items-center"
          size="sm"
          pretendard="B"
        >
          <PiRectangleDuotone />
          셀(Cell) 편집
        </Typography>
        <Card shadow="none" width="100%">
          <div className="grid col-4 gap-10">
            {cellBtnList.map(({ icon, onClick }, index) =>
              renderBtn(icon, onClick)
            )}
          </div>
        </Card>
      </div>
      {/* 테이블 설정 */}
      {/* <div className="flex flex-col gap-5">
        <Typography
          as="div"
          className="flex gap-3 items-center"
          size="sm"
          pretendard="B"
        >
          <RiColorFilterAiFill />
          테이블 설정
        </Typography>
        
        <Card shadow="none" width="100%">
          <div className="grid col-2 gap-10">
            <div className="flex gap-10 items-center justify-start">
              <Typography size="sm">헤더 색상</Typography>
              <div onMouseDown={(event) => event.preventDefault()}>
                <ColorPicker
                  open={headerColorPickerOpen}
                  setOpen={setHeaderColorPickerOpen}
                  onChange={(color) => {
                    console.log(color.hex);
                    if (editor) {
                      editor.chain().focus().setHeaderColor(color.hex).run();
                    }
                  }}
                >
                  {renderBtn(CgColorBucket, () => {}, "")}
                </ColorPicker>
              </div>
            </div>
            <div className="flex gap-10 items-center justify-end">
              <Typography size="sm">선 색상</Typography>
              <div onMouseDown={(event) => event.preventDefault()}>
                <ColorPicker
                  open={borderColorPickerOpen}
                  setOpen={setBorderColorPickerOpen}
                  onChange={(color) => {
                    if (editor) {
                      editor.chain().focus().setBorderColor(color.hex).run();
                    }
                  }}
                >
                  {renderBtn(CgColorBucket, () => {}, "")}
                </ColorPicker>
              </div>
            </div>
          </div>
        </Card> 
        
      </div>*/}

      {/* <button onClick={() => editor.chain().focus().deleteTable().run()}>
        Delete table
      </button> */}
    </div>
  );
}
