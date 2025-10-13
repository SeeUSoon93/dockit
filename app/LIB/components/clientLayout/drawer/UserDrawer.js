import { Avatar, Button, Div, Drawer, Progress, Tag, Typography } from "sud-ui";
import Template from "./Template";
import { useState } from "react";
import { useUser } from "@/app/LIB/context/UserContext";
import { GiTwoCoins } from "react-icons/gi";
import { TbDiamondFilled, TbRefresh } from "react-icons/tb";
import { refreshUserPoint } from "@/app/LIB/utils/authUtils";

export default function UserDrawer({ openUserDrawer, setOpenUserDrawer }) {
  const { user, userLoading, setUser, refreshUser } = useUser();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDeleteUser = () => {
    setDeleteModalOpen(true);
  };

  const refreshUserPoint = async () => {
    if (!user.ai_beta_points) {
      console.log("포인트 없음");
      const response = await refreshUserPoint({
        ai_beta_points: 2000
      });
      console.log(response);
      setUser({
        ...user,
        ai_beta_points: response.user.ai_beta_points
      });
    } else {
      refreshUser();
    }
  };

  return (
    <Drawer
      open={openUserDrawer}
      onClose={() => setOpenUserDrawer(false)}
      width="400px"
      divider={false}
    >
      <Template
        title="회원 설정"
        setOpen={setOpenUserDrawer}
        content={
          !userLoading &&
          user && (
            <div className="flex flex-col gap-30">
              {/* 회원 프로필 */}
              <div className="flex gap-10 items-center">
                <Avatar src={user.profileURL} size="sm" />
                <div className="flex flex-col">
                  <Typography pretendard="SB" size="lg">
                    {user.display_name}
                  </Typography>
                  <Typography size="sm">{user.email}</Typography>
                </div>
              </div>

              {/* 포인트 */}
              <div className="flex flex-col gap-10">
                <div className="flex items-center gap-5">
                  <Div color="mint-7">
                    <GiTwoCoins size={25} />
                  </Div>
                  <Typography pretendard="SB">포인트</Typography>
                  <Tag colorType="mint">
                    <Typography size="xs" pretendard="SB">
                      Beta
                    </Typography>
                  </Tag>
                  <Button
                    icon={<TbRefresh />}
                    size="sm"
                    colorType="text"
                    onClick={() => refreshUser()}
                  />
                </div>
                <div className="flex flex-col items-end">
                  <Typography size="sm" pretendard="SB" color="mint-7">
                    {user.ai_beta_points}P
                  </Typography>
                  <Progress
                    value={user.ai_beta_points || 0}
                    max={2000}
                    valuePosition="outside-right"
                    color="mint-7"
                    showText={false}
                  />
                </div>
                <Typography size="sm">
                  ※ 포인트는 AI기능 이용에 사용됩니다.
                </Typography>
                <Typography size="sm">
                  ※ Beta버전에서는 포인트 충전이 불가능합니다. 포인트는 매일
                  2000P씩 충전됩니다.
                </Typography>
              </div>

              {/* 구독관리 */}
              <div className="flex flex-col gap-10">
                <div className="flex items-center gap-5">
                  <Div color="mint-7">
                    <TbDiamondFilled size={25} />
                  </Div>
                  <Typography pretendard="SB">구독 관리</Typography>
                </div>
                <Typography size="sm">
                  ※ 구독기능은 차후 제공할 예정입니다.
                </Typography>
              </div>

              <div className="flex items-center justify-end">
                <Button colorType="text" onClick={() => handleDeleteUser()}>
                  <Typography
                    pretendard="SB"
                    size="sm"
                    className="flex items-center gap-5"
                    color="volcano"
                  >
                    회원탈퇴
                  </Typography>
                </Button>
              </div>
            </div>
          )
        }
      />
    </Drawer>
  );
}
