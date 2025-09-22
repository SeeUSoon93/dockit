"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Image,
  Input,
  Modal,
  toast,
  Typography
} from "sud-ui";
import { createData, deleteData, fetchDataList } from "../LIB/utils/dataUtils";
import { useRouter } from "next/navigation";
import { useUser } from "../LIB/context/UserContext";
import { TrashOutline } from "sud-icons";

import { getStorage, ref, deleteObject } from "firebase/storage";
const storage = getStorage();

export default function WorkspacePage() {
  const { user, userLoading } = useUser();
  const [hoverCardId, setHoverCardId] = useState(null);
  const router = useRouter();

  const [docList, setDocList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [deleteInput, setDeleteInput] = useState("");

  const fetch = async () => {
    const docs = await fetchDataList("documents");
    setDocList(docs.content);
  };

  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/");
    } else {
      fetch();
    }
  }, [router, user, userLoading]);

  const handleClickNew = async () => {
    const newDoc = await createData("documents");
    router.push(`/workspace/${newDoc.content._id}`);
  };

  const handleDeleteDoc = async () => {
    if (!selectedDocId || !user) return;
    try {
      const fileRef = ref(
        storage,
        `documents/${user.uid}/${selectedDocId}.html`
      );
      await deleteObject(fileRef);
      await deleteData("documents", selectedDocId);

      await fetch();
      toast.success("문서가 삭제되었습니다.");

      setModalOpen(false);
      setSelectedDocId(null);
      setDeleteInput("");
    } catch (error) {
      console.error("문서 삭제 중 오류 발생:", error);
    }
  };

  const cardRender = (item) => (
    <Card
      key={item._id || "new-doc"}
      shadow="none"
      width={"100%"}
      onMouseEnter={() => setHoverCardId(item._id)}
      onMouseLeave={() => setHoverCardId(null)}
      background={hoverCardId === item._id ? "white-8" : "transparent"}
      border={false}
      className="cursor-pointer"
      onClick={() => {
        if (!item._id) {
          handleClickNew();
        } else {
          router.push(`/workspace/${item._id}`);
        }
      }}
    >
      <div className="flex flex-col items-center justify-center gap-10 relative">
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <Button
            icon={<TrashOutline />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDocId(item._id);
              setModalOpen(true);
            }}
          />
        </div>
        <Card width={130} height={180} thumb={item.thumbnail || null} />
        <Typography pretendard="B">{item.title || "이름 없음"}</Typography>
      </div>
    </Card>
  );
  return (
    <div className="flex flex-col w-50 items-">
      <div className="grid col-3 gap-10">
        {cardRender({ title: "새 문서" })}
        {docList.map((item) => cardRender(item))}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col ">
          <Typography>정말 문서를 삭제하시겠습니까?</Typography>
          <div>
            <Typography color={"volcano"} size="sm" pretendard="SB">
              ※ 삭제된 문서는 복구가 불가능합니다.{" "}
            </Typography>
            <Typography size="sm">
              삭제하려면 <b>&quot;문서 삭제&quot;</b>를 입력해주세요.
            </Typography>
          </div>
          <Input
            placeholder="문서 삭제"
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
              onClick={() => handleDeleteDoc()}
              disabled={deleteInput !== "문서 삭제"}
            >
              삭제
            </Button>
            <Button
              onClick={() => {
                setModalOpen(false);
                setDeleteInput("");
                setSelectedDocId(null);
              }}
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
