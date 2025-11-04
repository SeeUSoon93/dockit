import { useEffect, useState } from "react";
import Template from "./Template";
import { Typography } from "sud-ui";
import { fetchDataTree } from "@/app/LIB/utils/dataUtils";
import { FcFolder, FcDocument } from "react-icons/fc";
import { AngleDown, AngleRight } from "sud-icons";
import { useUser } from "@/app/LIB/context/UserContext";
import { useRouter } from "next/navigation";

export default function LeftDrawer({ openLeftDrawer, setOpenLeftDrawer }) {
  const { user, userLoading } = useUser();
  const router = useRouter();
  const [folderTree, setFolderTree] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // 폴더 트리 가져오기
  const fetchFolderTree = async () => {
    try {
      const result = await fetchDataTree("tree"); // 새로운 엔드포인트 사용
      setFolderTree(result.tree);
    } catch (error) {
      console.error("폴더 트리 가져오기 실패:", error);
    }
  };
  // 초기 로드
  useEffect(() => {
    if (!user && !userLoading) {
      return;
    } else if (user) {
      fetchFolderTree();
    }
  }, [user, userLoading]);

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

  // 파일만 필터링
  const filterFiles = (items) => {
    return items.filter((item) => item.content_type === "documents");
  };
  const renderTree = (items, level = 0) => {
    const folders = filterFolders(items);
    const files = filterFiles(items);

    return (
      <>
        {/* 폴더들 렌더링 */}
        {folders.map((folder) => {
          const isExpanded = expandedFolders.has(folder._id);
          const hasChildren = folder.children && folder.children.length > 0;
          const childFolders = hasChildren
            ? filterFolders(folder.children)
            : [];
          const childFiles = hasChildren ? filterFiles(folder.children) : [];

          return (
            <div key={folder._id} className="w-100">
              <div
                className={`flex items-center gap-10 pd-10 cursor-pointer hover:bg-gray-100 rounded ${
                  selectedFolderId === folder._id ? "bg-blue-100" : ""
                }`}
                style={{ paddingLeft: `${level * 20 + 10}px` }}
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
                  {(childFolders.length > 0 || childFiles.length > 0) && (
                    <Typography size="xs" color="cool-gray-5">
                      ({childFolders.length + childFiles.length})
                    </Typography>
                  )}
                </div>
              </div>

              {/* 하위 폴더들 */}
              {hasChildren && isExpanded && childFolders.length > 0 && (
                <div>{renderTree(folder.children, level + 1)}</div>
              )}
              {hasChildren && isExpanded && childFiles.length > 0 && (
                <div>{renderTree(folder.children, level + 1)}</div>
              )}
            </div>
          );
        })}

        {/* 파일들 렌더링 */}
        {files.map((file) => (
          <div key={file._id} className="w-100">
            <div
              className="flex items-center gap-10 pd-10 cursor-pointer hover:bg-gray-100 rounded"
              style={{ paddingLeft: `${level * 20 + 10}px` }}
              onDoubleClick={() => {
                router.push(`/workspace/${file._id}`);
                setOpenLeftDrawer(false);
              }}
            >
              <FcDocument size={20} />
              <Typography size="sm">{file.title}</Typography>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <Template
      title="폴더"
      open={openLeftDrawer}
      onClose={() => setOpenLeftDrawer(false)}
      content={
        <div className="flex flex-col">
          <div
            className={`flex items-center pd-10 cursor-pointer hover:bg-gray-100 rounded ${
              selectedFolderId === null ? "bg-blue-100" : ""
            }`}
            onClick={() => setSelectedFolderId(null)}
          >
            <Typography size="sm">홈</Typography>
          </div>
          {folderTree && folderTree.length > 0 && renderTree(folderTree)}
        </div>
      }
    />
  );
}
