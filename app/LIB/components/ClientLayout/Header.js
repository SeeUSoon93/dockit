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
import { Button, Div, Tooltip } from "sud-ui";
import { logoutUser } from "../../utils/authUtils";
import { useRouter } from "next/navigation";
export default function Header({
  user,
  userLoading,
  isDarkMode,
  setIsDarkMode,
  setOpenLeftDrawer,
  setOpenWidgetDrawer,
  setOpenSettingsDrawer
}) {
  const router = useRouter();

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
    <Div className="flex justify-between items-center">
      {!userLoading && user && (
        <>
          {/* 왼쪽 */}
          <div>{leftIcons.map((data) => renderBtn(data))}</div>
          {/* 중앙 */}
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold">
              {/* 작성중인 문서 제목 들어감 */}

              {/* 자동저장 중이라는 표시로 원 표시 */}
            </div>
          </div>

          {/* 오른쪽 */}
          <div>{rightIcons.map((data) => renderBtn(data))}</div>
        </>
      )}
    </Div>
  );
}
