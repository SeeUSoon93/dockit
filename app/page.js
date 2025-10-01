"use client";
import { LogoGoogle } from "sud-icons";
import { Button, Card, Div, Divider, Image, Tag, Typography } from "sud-ui";
import { handleGoogleAuth } from "./LIB/utils/authUtils";
import { useUser } from "./LIB/context/UserContext";
import { useRouter } from "next/navigation";
import {
  TbBrowserCheck,
  TbChartDotsFilled,
  TbFileTypePdf,
  TbWriting
} from "react-icons/tb";
import { RiAiGenerate2, RiChatAiFill, RiFilePaper2Line } from "react-icons/ri";
import { MdOutlineWidgets } from "react-icons/md";
import { AiOutlineCloudSync } from "react-icons/ai";
import { LuTableOfContents } from "react-icons/lu";
import { PiProjectorScreenChartBold } from "react-icons/pi";
import { useLayout } from "./LIB/context/LayoutContext";
import { useEffect } from "react";

export default function Home() {
  const { user, userLoading } = useUser();
  const router = useRouter();
  const { layoutMode } = useLayout();

  const onLogin = async () => {
    try {
      await handleGoogleAuth();
      router.push("/workspace");
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    if (user && !userLoading) {
      router.push("/workspace");
    }
  }, [user, userLoading, router]);

  const cardRender = (item, index) => {
    const Icon = item.icon;
    const background = (index + 1) % 2 === 0 ? "mint-1" : "white-10";

    return (
      <Card
        width={"100%"}
        key={item.title}
        className="hover-shadow-6"
        background={background}
        border={false}
      >
        <Div className="flex flex-col items-center gap-10" color={"mint-7"}>
          <Icon size={60} />
          <Typography as="p" size="lg" pretendard="SB" color={"mint-7"}>
            {item.title}
          </Typography>
          <Typography as="p" color={"black-9"}>
            {item.description}
          </Typography>
        </Div>
      </Card>
    );
  };

  const renderList = [
    {
      icon: TbBrowserCheck,
      title: "웹 브라우저만 있으면 끝!",
      description: "스마트폰, 태블릿, 데스크탑에서 빠르게 문서를 작성하세요."
    },
    {
      icon: RiFilePaper2Line,
      title: "제한 없는 콘텐츠 작성",
      description: "페이지 나눔 없이 콘텐츠를 끊김 없이 작성하세요."
    },
    {
      icon: AiOutlineCloudSync,
      title: "클라우드 자동 저장",
      description: "자동 백업으로 중요한 내용을 안전하게 보관하세요."
    }
  ];

  const widgetCardRender = (item, index) => {
    const isEven = index % 2 === 0;
    const Icon = item.icon;

    return (
      <div className="flex flex-col gap-10 items-center">
        <div
          className="gap-10 w-100 items-center"
          style={{
            display: "grid",
            gridTemplateColumns:
              layoutMode === "desktop"
                ? isEven
                  ? "3fr 1fr"
                  : "1fr 3fr"
                : "1fr"
          }}
        >
          {isEven && <video src={item.video} autoPlay loop muted />}
          <Card width={"100%"} key={item.title} shadow="none" border={false}>
            <Div className="flex flex-col items-center gap-10" color={"mint-7"}>
              <Icon size={60} />
              <Typography as="p" size="xl" pretendard="SB" color={"mint-7"}>
                {item.title}
              </Typography>
            </Div>
          </Card>
          {!isEven && <video src={item.video} autoPlay loop muted />}
        </div>
        <div className="pd-30 text-center">
          {item.detail.map((item, index) => (
            <Typography as="p" key={index} pretendard="SB" size="xl">
              {item}
            </Typography>
          ))}
        </div>
      </div>
    );
  };

  const renderWidgetList = [
    {
      icon: RiAiGenerate2,
      title: "AI 위젯",
      video: "/video/ai-widget.mp4",
      detail: [
        "AI에게 질문하기 위한 다른 인터넷 창은 필요 없습니다.",
        "필요한 이미지를 바로 생성하세요.",
        <br key={"br"} />,
        "더 이상 여러 인터넷창을 띄우고, AI를 찾아다니지 않아도 됩니다."
      ]
    },
    {
      icon: TbWriting,
      title: "문서 작성 도구",
      video: "/video/chart.mp4",
      detail: [
        "자주 사용하는 특수문자를 클릭 한번으로 삽입하세요.",
        "헤드를 지정하여 목차를 자동으로 생성하고, 해당 부분으로 빠르게 이동하세요.",
        "더 이상 직접 차트를 그리지 않아도 됩니다. 표만 넣으세요.",
        <br key={"br"} />,
        "문서 작성 속도를 높이세요."
      ]
    },
    {
      icon: TbWriting,
      title: "자료 탐색",
      video: "/video/data.mp4",
      detail: [
        "모르는 단어는 바로 검색하세요.",
        "필요한 사진, 행정구역 지도를 쉽게 찾으세요.",
        <br key={"br"} />,
        "더 이상 인터넷 창을 띄우고, 자료를 찾아다니지 않아도 됩니다."
      ]
    }
  ];

  return (
    <div
      className={`flex flex-col items-center w-100 gap-${
        layoutMode === "desktop" ? "100" : "50"
      }`}
    >
      {/* #1. 소개 문구와 메인 이미지 */}
      <div
        className={`grid col-${
          layoutMode === "desktop" ? "2 w-60 pd-y-150" : "1 w-90 pd-y-100"
        }  `}
      >
        {/* 소개 문구 */}
        <div
          className={`flex flex-col items-${
            layoutMode === "desktop" ? "start" : "center"
          } gap-50 justify-center`}
        >
          <div className="flex flex-col items-start gap-10">
            <div className="flex items-end gap-10">
              <Image
                style={{ cursor: "default" }}
                src="/logo/logo.svg"
                alt="Logo"
                width={120}
                preview={false}
                mask={null}
              />
              <Tag shadow="sm" colorType="mint">
                <Typography size="xs" pretendard="SB">
                  Beta 0.1.0
                </Typography>
              </Tag>
            </div>
            <Typography
              as="h1"
              pretendard="B"
              style={{ fontSize: layoutMode === "desktop" ? 36 : 24 }}
            >
              쓰는 것에만 집중하세요.
              <br />
              가장 심플한 온라인 문서, 독킷.
            </Typography>
          </div>
          <Button icon={<LogoGoogle />} shape="capsule" onClick={onLogin}>
            <Typography className="px-20 py-10">Google로 시작하기</Typography>
          </Button>
        </div>
        {/* 메인 이미지 */}
        <div className="flex justify-center">
          <Image
            style={{ cursor: "default" }}
            src="/image/main-01.png"
            alt="sample"
            width={"100%"}
            preview={false}
            mask={null}
            shape="rounded"
          />
        </div>
      </div>

      {/* #2. 상세 소개 1 */}
      <Div
        className={`flex flex-col items-center w-100 pd-y-${
          layoutMode === "desktop" ? "150" : "100"
        }`}
        background={"mint-3"}
      >
        <div
          className={`flex flex-col items-center gap-50 w-${
            layoutMode === "desktop" ? "50" : "90"
          }`}
        >
          <Typography
            as="h2"
            pretendard="SB"
            style={{ fontSize: layoutMode === "desktop" ? 32 : 24 }}
          >
            위키, 아이디어 작성에 가장 빠른 시작
          </Typography>
          <div
            className={`grid col-${
              layoutMode === "desktop" ? "3" : "1"
            } gap-10 w-100`}
          >
            {renderList.map((item, index) => cardRender(item, index))}
          </div>
        </div>
      </Div>

      {/* #2. 상세 소개 3 */}
      <Div
        className={`flex flex-col items-center w-100 pd-y-${
          layoutMode === "desktop" ? "150" : "100"
        }`}
        background={"white-10"}
      >
        <div
          className={`flex flex-col items-center gap-50 w-${
            layoutMode === "desktop" ? "60" : "90"
          }`}
        >
          <Typography
            as="h2"
            pretendard="SB"
            style={{ fontSize: layoutMode === "desktop" ? 32 : 24 }}
          >
            문서 작성을 돕는 다양한 위젯
          </Typography>
          <div className="flex flex-col gap-200">
            {renderWidgetList.map((item, index) =>
              widgetCardRender(item, index)
            )}
          </div>
        </div>
      </Div>

      {/* 개인정보 처리방침 * 이용약관 */}
      <Div
        className="flex flex-col justify-center items-center w-100 pd-t-50 pd-b-10 gap-50"
        background={"mint-1"}
      >
        <div className="flex justify-center items-center w-100">
          <Button
            colorType="text"
            onClick={() => router.push("/privacy-policy")}
          >
            <Typography>개인정보 처리방침</Typography>
          </Button>
          <Divider vertical style={{ height: "10px" }} />
          <Button
            colorType="text"
            onClick={() => router.push("/terms-of-service")}
          >
            <Typography>이용약관</Typography>
          </Button>
        </div>
        <Typography size="sm" color="cool-gray-7" pretendard="B">
          All rights reserved @seeusoon93
        </Typography>
      </Div>
    </div>
  );
}
