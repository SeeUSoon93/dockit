import {
  AngleLeft,
  GridFourDiaOutline,
  HomeOutline,
  LogoutCircle,
  MenuHamburger,
  MoonOutline,
  SettingOutline,
  SunOutline
} from "sud-icons";
import { Button, Div, Tooltip, Typography } from "sud-ui";
import { logoutUser } from "../../utils/authUtils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TitleEditor from "../Write/TitleEditor";
import { useDebounce } from "../../utils/useDebounce";
import WriteHeader from "./Header/WriteHeader";
import { MdSync } from "react-icons/md";
import { useSetting } from "../../context/SettingContext";
import { useDocument } from "../../context/DocumentContext";
export default function Header({
  user,
  userLoading,
  isDarkMode,
  setIsDarkMode,
  setOpenLeftDrawer,
  setOpenWidgetDrawer,
  setOpenSettingsDrawer,
  isEditPage,
  document,
  saveDocument,
  isSaving
}) {
  const router = useRouter();
  const { setting } = useSetting();
  const { title, setTitle } = useDocument();

  // ■■■■■■■■■ 제목 ■■■■■■■■■■■■■■■■
  const debouncedTitle = useDebounce(title, setting.autoSaveDelay);

  useEffect(() => {
    if (document && debouncedTitle !== document.title) {
      saveDocument(document._id, { title: debouncedTitle });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle]);

  //■■■■■■■■■■ 아이콘 렌더링 ■■■■■■■■■■■■■■
  // 왼쪽 아이콘
  const leftIcons = [
    {
      tooltip: "뒤로가기",
      onClick: () => router.back(),
      icon: AngleLeft
    },
    {
      tooltip: "워크스페이스 홈",
      onClick: () => router.push("/workspace"),
      icon: HomeOutline
    },
    {
      tooltip: "메뉴",
      onClick: () => setOpenLeftDrawer(true),
      icon: MenuHamburger
    }
  ];
  // 오른쪽 아이콘
  const rightIcons = [
    {
      tooltip: "위젯 설정",
      onClick: () => setOpenWidgetDrawer(true),
      icon: GridFourDiaOutline
    },
    {
      tooltip: "설정",
      onClick: () => setOpenSettingsDrawer(true),
      icon: SettingOutline
    },
    {
      tooltip: "테마 변경",
      onClick: () => setIsDarkMode(!isDarkMode),
      icon: isDarkMode ? SunOutline : MoonOutline
    },
    {
      tooltip: "로그아웃",
      onClick: async () => await logoutUser(),
      icon: LogoutCircle
    }
  ];
  //   아이콘 렌더링
  const renderBtn = (data) => {
    const Icon = data.icon;
    return (
      <Tooltip
        key={data.tooltip}
        content={data.tooltip}
        placement="bottom"
        background="mint"
        color="mint-1"
        border={false}
        arrow={false}
      >
        <Button
          colorType="text"
          size="sm"
          onClick={data.onClick}
          icon={Icon && <Icon size="16" />}
          color="mint-8"
        />
      </Tooltip>
    );
  };

  return (
    !userLoading &&
    user && (
      <Div className="flex flex-col gap-5">
        {/* 기본 헤더 */}
        <div className="flex items-center justify-between">
          {/* 왼쪽 */}
          <div>{leftIcons.map((data) => renderBtn(data))}</div>
          {/* 중앙 */}
          <div className="flex items-center gap-2">
            {/* 작성중인 문서 제목 들어감 */}
            {isEditPage && document && (
              <div className="flex items-end gap-10">
                <Typography as="h1" pretendard="B" size="lg">
                  <TitleEditor
                    value={title}
                    onChange={(newTitle) => setTitle(newTitle)}
                  />
                </Typography>
                {isSaving && (
                  <Typography
                    as="div"
                    className="flex items-center gap-5"
                    size="sm"
                    color={"cool-gray"}
                  >
                    <MdSync className="animate-spin" /> 저장 중...
                  </Typography>
                )}
              </div>
            )}
          </div>

          {/* 오른쪽 */}
          <div>{rightIcons.map((data) => renderBtn(data))}</div>
        </div>
        {/* 문서 편집 헤더 */}
        {isEditPage && document && <WriteHeader />}
      </Div>
    )
  );
}
