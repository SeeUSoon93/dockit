import { Button, Card, Modal, Typography } from "sud-ui";
import { useState, useEffect } from "react";
import { FcFolder } from "react-icons/fc";
import { AngleDown, AngleRight } from "sud-icons";
// import { ChevronRight, ChevronDown } from "sud-icons";

export default function MoveModal({
  modalOpen,
  setModalOpen,
  selectedItem,
  handleMoveContent,
  folderTree,
}) {
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    if (modalOpen) {
      setSelectedFolderId(null);
    }
  }, [modalOpen]);

  const handleSubmit = () => {
    if (selectedItem) {
      handleMoveContent(
        selectedItem.content_type,
        selectedItem._id,
        selectedFolderId // null이면 최상위로 이동
      );
      setModalOpen(false);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setSelectedFolderId(null);
  };

  // 폴더 토글
  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // 폴더만 필터링
  const filterFolders = (items) => {
    return items.filter((item) => item.content_type === "folders");
  };

  const renderTree = (items, level = 0) => {
    const folders = filterFolders(items);

    return folders.map((folder) => {
      const isExpanded = expandedFolders.has(folder._id);
      const hasChildren = folder.children && folder.children.length > 0;
      const childFolders = hasChildren ? filterFolders(folder.children) : [];

      return (
        <div key={folder._id} className="w-100">
          <div
            className={`flex items-center gap-10 pd-10 cursor-pointer hover:bg-gray-100 rounded ${
              selectedFolderId === folder._id ? "bg-blue-100" : ""
            }`}
            style={{ paddingLeft: `${level * 15 + 10}px` }}
          >
            {/* 토글 버튼 */}
            {hasChildren && (
              <div
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder._id);
                }}
              >
                {isExpanded ? (
                  <AngleDown size={10} />
                ) : (
                  <AngleRight size={10} />
                )}
              </div>
            )}

            {/* 폴더 아이콘과 이름 */}
            <div
              className="flex items-center gap-10 flex-1"
              onClick={() => setSelectedFolderId(folder._id)}
            >
              <FcFolder size={20} />
              <Typography size="sm">{folder.title}</Typography>
              {childFolders.length > 0 && (
                <Typography size="xs" color="cool-gray-5">
                  ({childFolders.length})
                </Typography>
              )}
            </div>
          </div>

          {/* 하위 폴더들 */}
          {hasChildren && isExpanded && childFolders.length > 0 && (
            <div>{renderTree(folder.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <Modal open={modalOpen} onClose={handleCancel}>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <Typography pretendard="SB" size="lg">
            폴더 이동
          </Typography>
          <Typography size="sm" color="cool-gray-6">
            &quot;{selectedItem?.title}&quot;을(를) 이동할 폴더를 선택하세요.
          </Typography>
        </div>
        <Card
          className="flex-1 overflow-y-auto"
          width={"100%"}
          shadow="none"
          borderColor="black-7"
        >
          <div
            className={`flex items-center gap-10 pd-10 cursor-pointer hover:bg-gray-100 rounded ${
              selectedFolderId === null ? "bg-blue-100" : ""
            }`}
            onClick={() => setSelectedFolderId(null)}
          >
            <Typography size="sm">홈</Typography>
          </div>
          {folderTree && folderTree.length > 0 && renderTree(folderTree)}
        </Card>

        <div className="flex justify-end gap-10 mg-t-20">
          <Button
            background="blue"
            color="blue-1"
            onClick={handleSubmit}
            disabled={selectedFolderId === undefined}
          >
            이동
          </Button>
          <Button onClick={handleCancel}>취소</Button>
        </div>
      </div>
    </Modal>
  );
}
