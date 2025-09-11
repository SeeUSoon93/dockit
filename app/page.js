"use client";
import { LogoGoogle } from "sud-icons";
import { Button, Typography } from "sud-ui";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* 메인페이지는 나중에 꾸미기 */}
      {/* 우선은 로그인만 구현 */}
      <Button icon={<LogoGoogle />}>
        <Typography>Google로 시작하기</Typography>
      </Button>
    </div>
  );
}
