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
import {
  RiAiGenerate2,
  RiChatAiFill,
  RiFilePaper2Line,
  RiToolsFill
} from "react-icons/ri";
import { MdOutlineWidgets, MdScreenSearchDesktop } from "react-icons/md";
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

    const card = (
      <Card width={"100%"} key={item.title} shadow="none" border={false}>
        <Div className="flex flex-col items-center gap-10" color={"mint-7"}>
          <Icon size={60} />
          <Typography as="p" size="xl" pretendard="SB" color={"mint-7"}>
            {item.title}
          </Typography>
        </Div>
      </Card>
    );

    const videoCard = (
      <Card
        className="hover-scale-6"
        width={"100%"}
        border={false}
        thumb={
          <video
            src={item.video}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onLoadStart={() => console.log("비디오 로딩 시작")}
            onCanPlay={() => console.log("비디오 재생 가능")}
            onError={(e) => console.log("비디오 로딩 오류:", e)}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover"
            }}
          />
        }
      />
    );

    return (
      <div className="flex flex-col gap-10 items-center">
        {layoutMode === "desktop" ? (
          <div
            className="gap-10 w-100 items-center"
            style={{
              display: "grid",
              gridTemplateColumns: isEven ? "3fr 1fr" : "1fr 3fr"
            }}
          >
            {isEven && videoCard}
            {card}
            {!isEven && videoCard}
          </div>
        ) : (
          <div className="flex flex-col gap-10 w-100 items-center">
            {card}
            {videoCard}
          </div>
        )}
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
        "문서 작업 중, 똑똑한 AI 조수에게 바로 질문하고 답변을 얻으세요.",
        "단순한 텍스트 입력만으로, 아이디어를 생생한 이미지로 만들어보세요.",
        <br key={"br"} />,
        "Dockit 안에서, 생각의 흐름을 끊지 않고 창의력을 발휘하세요."
      ]
    },
    {
      icon: TbWriting,
      title: "문서 작성 도구",
      video: "/video/chart.mp4",
      detail: [
        "클릭 한 번으로, 자주 쓰는 특수문자와 기호를 손쉽게 추가하세요.",
        "문서의 헤딩을 분석해 클릭 가능한 목차를 자동으로 생성합니다.",
        "복잡한 표 데이터를 선택 즉시 시각적인 차트로 변환하세요.",
        <br key={"br"} />,
        "단순 작업은 Dockit에게 맡기고, 가장 중요한 본질에만 집중하세요."
      ]
    },
    {
      icon: MdScreenSearchDesktop,
      title: "자료 탐색",
      video: "/video/data.mp4",
      detail: [
        "궁금한 단어는 즉시 사전에서 의미를 확인하세요.",
        "고품질의 이미지를 검색하고 문서에 바로 삽입하여 완성도를 높이세요.",
        "보고서에 필요한 대한민국 행정구역 지도를 손쉽게 추가하세요.",
        <br key={"br"} />,
        "자료 조사를 위해 더 이상 화면을 전환할 필요 없습니다. 문서 안에서 모든 것을 해결하세요."
      ]
    },
    {
      icon: RiToolsFill,
      title: "기타 도구",
      video: "/video/etc.mp4",
      detail: [
        "번뜩이는 아이디어를 기록할 메모장부터 일정 관리, 빠른 계산까지 모두 한 곳에서.",
        "다국어 번역기를 이용해 언어의 장벽 없이 자료를 이해하고 소통하세요.",
        "내장된 타이머와 스톱워치로 작업 시간을 관리하며 집중력을 유지하세요."
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
