"use client";
import { LogoGoogle } from "sud-icons";
import { Button, Typography } from "sud-ui";
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

  return (
    <div className="flex flex-col items-center justify-center w-100">
      {/* 메인페이지는 나중에 꾸미기 */}
      {/* 우선은 로그인만 구현 */}
      <Button icon={<LogoGoogle />} shape="capsule" onClick={onLogin}>
        <Typography className="px-20 py-10">Google로 시작하기</Typography>
      </Button>
    </div>
  );
}
