"use client";
import { LogoGoogle } from "sud-icons";
import { Button, Image, Typography } from "sud-ui";
import { handleGoogleAuth } from "./LIB/utils/authUtils";
import { useUser } from "./LIB/context/UserContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();

  const onLogin = async () => {
    try {
      await handleGoogleAuth();
      router.push("/workspace");
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
    }
  };
  if (user) {
    router.push("/workspace");
  }

  return (
    <div className="flex flex-col items-center justify-center w-100 pd-y-20">
      <div className="flex flex-col items-center gap-30 w-50">
        <div className="flex flex-col items-center">
          <Image
            src="/logo/logo.svg"
            alt="Logo"
            width={100}
            preview={false}
            mask={null}
          />
          <Typography as="h1" pretendard="B" style={{ fontSize: 50 }}>
            손쉬운 온라인 문서 작업
          </Typography>
        </div>
        <Image
          src="/image/sample.png"
          alt="sample"
          width={"100%"}
          preview={false}
          mask={null}
          shadow="md"
          shape="rounded"
        />
        <div className="flex flex-col items-center">
          <Typography size="lg">
            웹에서 쉽게 문서를 작성, 편집 및 공유할 수 있습니다.
          </Typography>
          <Typography size="lg">
            익숙한 UI와 작업을 돕는 위젯으로 간편하게 문서를 작성하세요.
          </Typography>
        </div>
        <Button icon={<LogoGoogle />} shape="capsule" onClick={onLogin}>
          <Typography className="px-20 py-10">Google로 시작하기</Typography>
        </Button>
      </div>
    </div>
  );
}
