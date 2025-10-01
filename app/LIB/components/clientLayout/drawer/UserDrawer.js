import {
  Avatar,
  Button,
  Divider,
  Drawer,
  Input,
  Switch,
  Typography,
} from "sud-ui";
import Template from "./Template";
import { AiFillSave } from "react-icons/ai";
import { useState } from "react";
import { TbClockRecord } from "react-icons/tb";
import { useUser } from "@/app/LIB/context/UserContext";

export default function UserDrawer({ openUserDrawer, setOpenUserDrawer }) {
  const { user, userLoading } = useUser();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDeleteUser = () => {
    setDeleteModalOpen(true);
  };

  return (
    <Drawer
      open={openUserDrawer}
      onClose={() => setOpenUserDrawer(false)}
      width="400px"
    >
      <Template
        title="회원 설정"
        content={
          !userLoading &&
          user && (
            <div className="flex flex-col gap-10">
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
