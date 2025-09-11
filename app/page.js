"use client";
import { LogoGoogle } from "sud-icons";
import { Button, Typography } from "sud-ui";
import { handleGoogleAuth } from "./LIB/utils/authUtils";
import { useUser } from "./LIB/context/UserContext";

export default function Home() {
  const { user } = useUser();
  console.log(user);
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen">
      {/* 메인페이지는 나중에 꾸미기 */}
      {/* 우선은 로그인만 구현 */}
      <Button
        icon={<LogoGoogle />}
        shape="capsule"
        onClick={async () => await handleGoogleAuth()}
      >
        <Typography className="px-20 py-10">Google로 시작하기</Typography>
      </Button>
    </div>
  );
}
