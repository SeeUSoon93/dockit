import { inputProps } from "@/app/LIB/constant/uiProps";
import { useDocument } from "@/app/LIB/context/DocumentContext";
import { useUser } from "@/app/LIB/context/UserContext";
import { fetchUserList } from "@/app/LIB/utils/teamUtils";
import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  DotSpinner,
  Modal,
  Select,
  Typography,
} from "sud-ui";

export default function AddTeamMemberModal({
  addTeamMemberModalOpen,
  setAddTeamMemberModalOpen,
  selectedTeamMember,
  setSelectedTeamMember,
}) {
  const [userOptions, setUserOptions] = useState([]);
  const [teamMemberDetails, setTeamMemberDetails] = useState([]);
  const { user, userLoading } = useUser();
  const [isRemoving, setIsRemoving] = useState(false);
  const { setTeamMembers, teamMembers, document, saveDocument } = useDocument();

  useEffect(() => {
    // 모달이 열릴 때만 데이터 가져오기
    if (!addTeamMemberModalOpen) return;
    if (userLoading) return;

    const loadUserList = async () => {
      try {
        const response = await fetchUserList();

        // uid 중복 제거
        const uniqueUsers = response.users.filter(
          (user, index, self) =>
            index === self.findIndex((t) => t.uid === user.uid)
        );
        // 필터링
        const filteredUsers = uniqueUsers
          .filter((user) => user.display_name !== "테스터") // 테스터 제거
          .filter((u) => u.uid !== user.uid) // 현재 사용자 제거
          .filter((u) => !teamMembers.includes(u.uid)); // 팀 멤버 제거

        //   팀유저만 추출
        const teamMemberDetails = response.users.filter((u) =>
          teamMembers.includes(u.uid)
        );
        setTeamMemberDetails(teamMemberDetails);

        setUserOptions(
          filteredUsers.map((user) => ({
            label: `${user.display_name} (${user.email})`,
            value: user.uid,
          }))
        );
      } catch (error) {
        setUserOptions([]);
      }
    };
    loadUserList();
  }, [addTeamMemberModalOpen, userLoading]);

  console.log(teamMemberDetails);

  return (
    <Modal
      open={addTeamMemberModalOpen}
      onClose={() => setAddTeamMemberModalOpen(false)}
    >
      <div className="flex flex-col gap-10">
        <Typography pretendard="SB" size="lg">
          팀원 초대
        </Typography>
        <Typography size="sm" color="cool-gray-6">
          초대할 팀원의 이메일을 선택해주세요.
        </Typography>
        <Select
          {...inputProps}
          placeholder="이메일"
          value={selectedTeamMember || []}
          onChange={(value) => setSelectedTeamMember(value)}
          options={userOptions}
          searchable
          multiMode
        />

        {teamMemberDetails.length > 0 && (
          <>
            <Typography pretendard="SB">
              현재 팀원 ({teamMemberDetails.length})
            </Typography>
            <div className="flex flex-wrap gap-10">
              {isRemoving ? (
                <DotSpinner />
              ) : (
                teamMemberDetails.map((user) => (
                  <div
                    className="flex flex-col item-cen jus-cen gap-5"
                    key={user.uid}
                    onDoubleClick={() => {
                      setIsRemoving(true);
                      const updatedMembers = teamMembers.filter(
                        (member) => member !== user.uid
                      );
                      setTeamMembers(updatedMembers);

                      // DB에 저장
                      if (document?._id) {
                        saveDocument(document._id, {
                          teamMembers: updatedMembers,
                        });
                      }
                    }}
                  >
                    <Avatar size="sm" src={user.profile_url} />
                    <Typography size="sm" pretendard="SB">
                      {user.display_name}
                    </Typography>
                  </div>
                ))
              )}
            </div>
            <Typography size="xs" color="cool-gray-6">
              ※ 더블클릭으로 팀원 제거
            </Typography>
          </>
        )}

        <div className="flex justify-end gap-10">
          <Button
            background="volcano"
            color="volcano-1"
            onClick={() => setAddTeamMemberModalOpen(false)}
          >
            취소
          </Button>
          <Button
            background="mint"
            color="mint-1"
            onClick={() => {
              if (!selectedTeamMember || selectedTeamMember.length === 0) {
                return;
              }

              // selectedTeamMember가 배열이므로 스프레드로 펼치기
              const selectedUids = Array.isArray(selectedTeamMember)
                ? selectedTeamMember
                : [selectedTeamMember];

              // 기존 teamMembers와 합치고 중복 제거
              const currentMembers = teamMembers || [];
              const newMembers = [
                ...new Set([...currentMembers, ...selectedUids]),
              ];

              // teamMembers 업데이트
              setTeamMembers(newMembers);

              // DB에 저장
              if (document?._id) {
                saveDocument(document._id, { teamMembers: newMembers });
              }

              // 모달 닫기 및 선택 초기화
              setSelectedTeamMember([]);
              setAddTeamMemberModalOpen(false);
            }}
          >
            초대
          </Button>
        </div>
      </div>
    </Modal>
  );
}
