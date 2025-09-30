"use client";
import { LogoGoogle } from "sud-icons";
import { Button, Card, Div, Divider, Image, Tag, Typography } from "sud-ui";
import { handleGoogleAuth } from "./LIB/utils/authUtils";
import { useUser } from "./LIB/context/UserContext";
import { useRouter } from "next/navigation";
import { TbBrowserCheck, TbFileTypePdf } from "react-icons/tb";
import { RiFilePaper2Line } from "react-icons/ri";
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
      title: "웹 브라우저만 있으면 어디서나!",
      description: "스마트폰, 태블릿, 데스크탑에서 빠르게 문서를 작성하세요.",
    },
    {
      icon: RiFilePaper2Line,
      title: "제한 없는 콘텐츠 작성",
      description: "페이지 나눔 없이 콘텐츠를 끊김 없이 작성하세요.",
    },
    {
      icon: MdOutlineWidgets,
      title: "다양한 위젯 제공",
      description: "문서 작성을 돕는 위젯 뿐 아니라 다양한 위젯을 제공합니다.",
    },
    {
      icon: PiProjectorScreenChartBold,
      title: "차트 생성",
      description:
        "표를 선택하면 자동으로 차트를 생성합니다. 쉽고 빠르게 차트를 생성하세요.",
    },
    {
      icon: AiOutlineCloudSync,
      title: "클라우드 자동 저장",
      description:
        "자동으로 문서를 클라우드에 저장합니다. 작성을 중단하더라도 자동으로 저장됩니다.",
    },

    {
      icon: LuTableOfContents,
      title: "목차 생성",
      description:
        "헤딩 설정으로 자동으로 목차를 생성합니다. 목차를 통해 해당 부분으로 이동하세요.",
    },
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
                Beta 0.1.0
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
    </div>
  );
}
