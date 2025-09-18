"use client";
import { useEffect, useState } from "react";
import { Card, Divider, Image, Typography } from "sud-ui";
import { createData, fetchDataList } from "../LIB/utils/dataUtils";
import { useRouter } from "next/navigation";
import { useUser } from "../LIB/context/UserContext";

export default function WorkspacePage() {
  const { user, userLoading } = useUser();
  const [hoverCardId, setHoverCardId] = useState(null);
  const router = useRouter();

  const [docList, setDocList] = useState([]);

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
      <div className="flex flex-col items-center justify-center gap-10">
        <Card width={130} height={180} thumb={item.thumbnail || null} />
        <Typography pretendard="B">{item.title || "이름 없음"}</Typography>
      </div>
    </Card>
  );
  console.log("Document List:", docList);
  return (
    <div className="flex flex-col w-50 items-">
      <div className="grid col-3 gap-10">
        {" "}
        {cardRender({ title: "새 문서" })}
        {docList.map((item) => cardRender(item))}
      </div>
    </div>
  );
}
