import { Button, Input, Modal, Typography } from "sud-ui";
import { useState, useEffect } from "react";

export default function RenameModal({
  modalOpen,
  setModalOpen,
  selectedItem,
  handleRenameContent,
}) {
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (selectedItem && modalOpen) {
      setNewName(selectedItem.title || "");
    }
  }, [selectedItem, modalOpen]);

  const handleSubmit = () => {
    if (newName.trim() && selectedItem) {
      handleRenameContent(
        selectedItem.content_type,
        selectedItem._id,
        newName.trim()
      );
      setModalOpen(false);
      setNewName("");
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setNewName("");
  };

  return (
    <Modal open={modalOpen} onClose={handleCancel}>
      <div className="flex flex-col">
        <Typography pretendard="SB" size="lg">
          이름 변경
        </Typography>
        <Typography size="sm" color="cool-gray-6" className="mg-t-5">
          새로운 이름을 입력해주세요.
        </Typography>
        <Input
          placeholder="이름을 입력하세요"
          shadow="none"
          size="sm"
          style={{ width: "100%" }}
          className="mg-t-10"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          autoFocus
        />
        <div className="flex justify-end gap-10 mg-t-20">
          <Button
            background="blue"
            color="blue-1"
            onClick={handleSubmit}
            disabled={!newName.trim()}
          >
            변경
          </Button>
          <Button onClick={handleCancel}>취소</Button>
        </div>
      </div>
    </Modal>
  );
}
