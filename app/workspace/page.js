"use client";
import { useEffect, useState } from "react";
import { Card, Divider, Typography } from "sud-ui";
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

  const cardRender = (item) => (
    <Card
      key={item._id}
      shadow="none"
      width={200}
      onMouseEnter={() => setHoverCardId(item._id)}
      onMouseLeave={() => setHoverCardId(null)}
      background={hoverCardId === item._id ? "white-8" : "transparent"}
      border={false}
      className="cursor-pointer"
      onClick={() => router.push(`/workspace/${item._id}`)}
    >
      <div className="flex flex-col items-center justify-center gap-10">
        <Card width={100} height={150} />
        <Typography pretendard="B">{item.title}</Typography>
      </div>
    </Card>
  );

  return (
    <div>
      {/* 새 문서 및 양식 */}
      <div className="flex flex-wrap gap-10">
        {cardRender({ title: "새 문서", _id: "new" })}
      </div>
      <Divider />
      {/* 최근 문서 */}
      <div className="flex flex-wrap gap-10">
        {docList.map((item) => cardRender(item))}
      </div>
    </div>
  );
}
