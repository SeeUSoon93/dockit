"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Div,
  Divider,
  DotSpinner,
  Image,
  toast,
  Typography,
  Upload
} from "sud-ui";
import {
  createData,
  deleteData,
  fetchDataList,
  updateData,
  moveData,
  fetchDataTree,
  convertFileToHtml
} from "../LIB/utils/dataUtils";
import { useRouter } from "next/navigation";
import { useUser } from "../LIB/context/UserContext";
import {
  getStorage,
  ref,
  deleteObject,
  uploadString,
  getDownloadURL
} from "firebase/storage";
import DeleteModal from "../LIB/components/workspace/DeleteModal";
import RenameModal from "../LIB/components/workspace/RenameModal";
import MoveModal from "../LIB/components/workspace/MoveModal";
import { TriangleLeft } from "sud-icons";
import { auth } from "../LIB/config/firebaseConfig";
import { FaFile, FaFolder } from "react-icons/fa6";
import { formatTime } from "../LIB/utils/commonUtils";

const storage = getStorage();

export default function WorkspacePage() {
  const { user, userLoading } = useUser();
  const router = useRouter();

  // 기본 상태
  const [contentList, setContentList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);

  // 모달 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0
  });

  // 드래그앤드롭 상태
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // 폴더 트리 상태
  const [folderTree, setFolderTree] = useState([]);

  // 데이터 가져오기
  const fetchContent = async (folderId = null) => {
    setListLoading(true);
    try {
      const docs = await fetchDataList("documents", folderId);
      const folders = await fetchDataList("folders", folderId);

      setContentList([folders.content, docs.content]);
      setCurrentFolderId(folderId);
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
    } finally {
      setListLoading(false);
    }
  };

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
      router.push("/");
    } else if (user) {
      fetchContent();
      fetchFolderTree();
    }
  }, [router, user, userLoading]);

  // 새 콘텐츠 생성
  const handleCreateContent = async (type, file = null) => {
    // 문서 개수 제한 체크 (전체 트리에서)
    if (type === "documents" || type === "uploads") {
      const countDocumentsInTree = (items) => {
        let count = 0;
        for (const item of items) {
          if (item.content_type === "documents") {
            count++;
          }
          if (item.children && item.children.length > 0) {
            count += countDocumentsInTree(item.children);
          }
        }
        return count;
      };

      const totalDocumentCount = countDocumentsInTree(folderTree);

      if (totalDocumentCount >= 10) {
        toast.danger("베타버전에서 문서는 최대 10개까지만 생성할 수 있습니다.");
        return;
      }
      if (type === "uploads") {
        if (!file) {
          toast.danger("파일을 선택해주세요.");
          return;
        }
      }
    }

    try {
      if (type === "uploads") {
        const response = await createData("documents", currentFolderId);
        const newContent = response.content;

        // 파일을 HTML로 변환
        toast.info("파일을 변환 중입니다...");
        const res = await convertFileToHtml(file);
        const htmlContent = await res.json();

        const dataForDB = {
          title: file.name.replace(/\.[^/.]+$/, "") // 확장자 제거
        };
        const uploadUser = auth.currentUser;
        if (!uploadUser) return;
        const storageRef = ref(
          storage,
          `documents/${uploadUser.uid}/${newContent._id}.html`
        );
        await uploadString(storageRef, htmlContent, "raw", {});
        const downloadURL = await getDownloadURL(storageRef);
        dataForDB.contentURL = downloadURL;

        // 변환된 HTML과 함께 문서 생성
        await updateData("documents", newContent._id, dataForDB);

        toast.success("파일이 성공적으로 업로드되었습니다!");
      } else {
        await createData(type, currentFolderId);
      }
      await fetchContent(currentFolderId);
      await fetchFolderTree(); // 폴더 트리도 새로고침
      toast.success(
        `${type === "documents" ? "문서" : "폴더"}가 생성되었습니다.`
      );
    } catch (error) {
      console.error("콘텐츠 생성 실패:", error);
      toast.danger(`생성에 실패했습니다`);
    }
  };

  // 폴더 열기
  const handleOpenFolder = (folderId, folderTitle) => {
    const newPath = [...currentPath, { id: folderId, title: folderTitle }];
    setCurrentPath(newPath);
    fetchContent(folderId);
  };

  // 뒤로가기
  const handleGoBack = () => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);

      if (newPath.length === 0) {
        fetchContent(null);
      } else {
        const parentFolder = newPath[newPath.length - 1];
        fetchContent(parentFolder.id);
      }
    }
  };

  // 삭제
  const handleDelete = async (type, contentId) => {
    if (!user || !contentId) return;
    try {
      // Firebase Storage에서 파일 삭제 (문서인 경우에만)
      if (type === "documents") {
        try {
          const fileRef = ref(
            storage,
            `documents/${user.uid}/${contentId}.html`
          );
          await deleteObject(fileRef);
        } catch (storageError) {
          console.error(storageError);
        }
      }

      await deleteData(type, contentId);
      await fetchContent(currentFolderId);
      await fetchFolderTree(); // 폴더 트리도 새로고침
      toast.success("삭제되었습니다.");
      setDeleteModalOpen(false);
      setDeleteInput("");
      setSelectedItem(null);
    } catch (error) {
      console.error("삭제 실패:", error);
      toast.danger("삭제에 실패했습니다.");
    }
  };

  // 이름 변경
  const handleRename = async (type, contentId, newTitle) => {
    if (!user || !contentId || !newTitle) return;
    try {
      await updateData(type, contentId, { title: newTitle });
      await fetchContent(currentFolderId);
      toast.success("이름이 변경되었습니다.");
      setRenameModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("이름 변경 실패:", error);
      toast.danger("이름 변경에 실패했습니다.");
    }
  };

  // 폴더 이동
  const handleMoveContent = async (type, contentId, newParentId) => {
    if (!user || !contentId) return;
    try {
      await moveData(type, contentId, newParentId);
      await fetchContent(currentFolderId);
      await fetchFolderTree(); // 폴더 트리도 새로고침
      toast.success("이동되었습니다.");
      setMoveModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("이동 실패:", error);
      toast.danger("이동에 실패했습니다.");
    }
  };

  // 드래그 시작
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  };

  // 드래그 끝
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // 드래그 오버
  const handleDragOver = (e, item) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (item.content_type === "folders" && item._id !== draggedItem?._id) {
      setDragOverItem(item);
    }
  };

  // 드래그 리브
  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  // 드롭
  const handleDrop = async (e, targetItem) => {
    e.preventDefault();

    if (!draggedItem || !targetItem || targetItem.content_type !== "folders") {
      setDragOverItem(null);
      return;
    }

    // 자기 자신을 드롭하는 경우 방지
    if (draggedItem._id === targetItem._id) {
      setDragOverItem(null);
      return;
    }

    // 폴더를 자기 하위 폴더로 이동하는 것 방지
    if (draggedItem.content_type === "folders") {
      const isSubFolder = currentPath.some(
        (folder) => folder.id === draggedItem._id
      );
      if (isSubFolder) {
        toast.danger("폴더를 자신의 하위 폴더로 이동할 수 없습니다.");
        setDragOverItem(null);
        return;
      }
    }

    try {
      await moveData(draggedItem.content_type, draggedItem._id, targetItem._id);
      await fetchContent(currentFolderId);
      await fetchFolderTree(); // 폴더 트리도 새로고침
      toast.success(
        `${draggedItem.title}이(가) ${targetItem.title} 폴더로 이동되었습니다.`
      );
    } catch (error) {
      console.error("이동 실패:", error);
    }

    setDragOverItem(null);
  };

  // 컨텍스트 메뉴
  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleClickOutside = () => {
    setContextMenu({ visible: false, x: 0, y: 0 });
    setSelectedItem(null);
  };

  return (
    <Div
      className="flex justify-center w-100 h-full overflow-y-auto"
      background={"white-9"}
      onContextMenu={handleContextMenu}
      onClick={handleClickOutside}
    >
      <div className="flex flex-col w-50 items-start pd-y-50">
        {/* 현재 경로 표시 */}
        <div className="flex items-center gap-10 mg-b-20 w-100">
          {currentPath.length > 0 && (
            <Div
              onClick={handleGoBack}
              className="flex items-center gap-5"
              color="cool-gray-8"
            >
              <TriangleLeft size={20} />
            </Div>
          )}
          <div className="flex items-center gap-5">
            <Typography color="cool-gray-6">홈</Typography>
            {currentPath.map((folder) => (
              <div key={folder.id} className="flex items-center gap-5">
                <Typography color="cool-gray-4">/</Typography>
                <Typography>{folder.title}</Typography>
              </div>
            ))}
          </div>
        </div>

        {/* 콘텐츠 목록 */}
        {listLoading ? (
          <div className="flex justify-center w-100 items-center pd-y-50">
            <DotSpinner />
          </div>
        ) : contentList.length === 0 ? (
          <div className="flex justify-center w-100 text-center pd-y-50">
            <Typography color={"cool-gray-7"}>
              컨텐츠가 없습니다.
              <br /> 마우스 우클릭으로 새 문서 또는 폴더를 만들어주세요.
            </Typography>
          </div>
        ) : (
          <div className="flex flex-col gap-30 w-100">
            {contentList.map(
              (list) =>
                list &&
                list.length > 0 && (
                  <div
                    key={list[0]._id}
                    className="grid col-4 gap-10 items-start w-100"
                  >
                    {list.map((item) => {
                      const type = item.content_type;
                      const isDragged = draggedItem?._id === item._id;
                      const isDragOver = dragOverItem?._id === item._id;

                      return (
                        <div
                          key={item._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleDragOver(e, item)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, item)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedItem(item);
                            setContextMenu({
                              visible: true,
                              x: e.clientX,
                              y: e.clientY
                            });
                          }}
                          onDoubleClick={() => {
                            if (type === "folders") {
                              handleOpenFolder(item._id, item.title);
                            } else {
                              router.push(`/workspace/${item._id}`);
                            }
                          }}
                          className={`cursor-pointer transition-all duration-200 w-100   ${
                            isDragged ? "opacity-50 scale-95" : ""
                          } ${
                            isDragOver ? "ring-2 ring-blue-500 bg-blue-50" : ""
                          }`}
                        >
                          <Div
                            className="flex flex-col items-center gap-5 rounded-lg pd-10 hover-shadow-6"
                            background={"white-10"}
                          >
                            <div className="flex items-center gap-5 w-100 overflow-hidden text-ellipsis whitespace-nowrap">
                              <Div color="mint-7">
                                {type === "documents" ? (
                                  <FaFile />
                                ) : (
                                  <FaFolder />
                                )}
                              </Div>
                              <Typography pretendard="SB">
                                {item.title}
                              </Typography>
                            </div>
                            {type === "documents" && (
                              <>
                                <Image
                                  src={item.thumbnail || "/logo/symbol.png"}
                                  alt={item.title}
                                  width={"100%"}
                                  height={170}
                                  preview={false}
                                  mask={null}
                                />

                                <div className="flex items-center gap-5 w-100 overflow-hidden text-ellipsis whitespace-nowrap justify-end">
                                  <Typography size="xs" color="cool-gray-8">
                                    {formatTime(item.updated_at)} 수정됨
                                  </Typography>
                                </div>
                              </>
                            )}
                          </Div>
                        </div>
                      );
                    })}
                  </div>
                )
            )}
          </div>
        )}

        {/* 삭제 모달 */}
        <DeleteModal
          modalOpen={deleteModalOpen}
          setModalOpen={setDeleteModalOpen}
          deleteInput={deleteInput}
          setDeleteInput={setDeleteInput}
          handleDeleteContent={() => {
            if (selectedItem) {
              handleDelete(selectedItem.content_type, selectedItem._id);
            }
          }}
          selectedItem={selectedItem}
        />

        {/* 이름 변경 모달 */}
        <RenameModal
          modalOpen={renameModalOpen}
          setModalOpen={setRenameModalOpen}
          selectedItem={selectedItem}
          handleRenameContent={handleRename}
        />

        {/* 폴더 이동 모달 */}
        <MoveModal
          modalOpen={moveModalOpen}
          setModalOpen={setMoveModalOpen}
          selectedItem={selectedItem}
          handleMoveContent={handleMoveContent}
          folderTree={folderTree}
        />

        {/* 컨텍스트 메뉴 */}
        {contextMenu.visible && (
          <Card
            className="fixed z-50"
            style={{
              left: contextMenu.x,
              top: contextMenu.y
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem ? (
              // 아이템이 선택된 경우: 이름 변경, 삭제 메뉴
              <>
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setRenameModalOpen(true);
                    setContextMenu({ visible: false, x: 0, y: 0 });
                  }}
                >
                  이름 변경
                </div>
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setMoveModalOpen(true);
                    setContextMenu({ visible: false, x: 0, y: 0 });
                  }}
                >
                  폴더 이동
                </div>
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                  onClick={() => {
                    setDeleteModalOpen(true);
                    setContextMenu({ visible: false, x: 0, y: 0 });
                  }}
                >
                  삭제
                </div>
              </>
            ) : (
              // 빈 공간 우클릭: 새로 만들기 메뉴
              <>
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleCreateContent("documents");
                    setContextMenu({ visible: false, x: 0, y: 0 });
                  }}
                >
                  새 문서 만들기
                </div>
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleCreateContent("folders");
                    setContextMenu({ visible: false, x: 0, y: 0 });
                  }}
                >
                  폴더 만들기
                </div>
                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <Upload
                    listType="none"
                    ext={["docx", "txt", "html", "htm", "md", "rtf"]}
                    onChange={(file) => {
                      setContextMenu({ visible: false, x: 0, y: 0 });
                      handleCreateContent("uploads", file);
                    }}
                  >
                    파일 업로드
                  </Upload>
                </div>
              </>
            )}
          </Card>
        )}
      </div>
    </Div>
  );
}
