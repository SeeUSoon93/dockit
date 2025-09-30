import { Button, Input, Modal, Typography } from "sud-ui";

export default function DeleteModal({
  modalOpen,
  setModalOpen,
  deleteInput,
  setDeleteInput,
  handleDeleteContent,
  selectedItem,
}) {
  return (
    <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
      <div className="flex flex-col ">
        <Typography>정말 삭제하시겠습니까?</Typography>
        <div>
          <Typography color={"volcano"} size="sm" pretendard="SB">
            ※ 삭제된 컨텐츠는 복구가 불가능합니다.{" "}
          </Typography>
          <Typography size="sm">
            삭제하려면 <b>&quot;삭제&quot;</b>를 입력해주세요.
          </Typography>
        </div>
        <Input
          placeholder="삭제"
          shadow="none"
          size="sm"
          style={{ width: "100%" }}
          className="mg-t-10"
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
        />
        <div className="flex justify-end gap-10 mg-t-20">
          <Button
            background="volcano"
            color="volcano-1"
            onClick={() => {
              if (selectedItem) {
                handleDeleteContent(
                  selectedItem.content_type,
                  selectedItem._id
                );
              }
            }}
            disabled={deleteInput !== "삭제"}
          >
            삭제
          </Button>
          <Button
            onClick={() => {
              setModalOpen(false);
              setDeleteInput("");
            }}
          >
            취소
          </Button>
        </div>
      </div>
    </Modal>
  );
}
