import { PiSealQuestionFill } from "react-icons/pi";
import WidgetCard from "./WidgetCard";
import { useUser } from "../../context/UserContext";
import {
  Button,
  Card,
  Div,
  Divider,
  Input,
  List,
  Tag,
  toast,
  Typography,
} from "sud-ui";
import { Plus } from "sud-icons";
import { useState, useEffect } from "react";
import {
  createData,
  deleteData,
  fetchData,
  fetchDataList,
  updateData,
} from "../../utils/dataUtils";
import { Skeleton } from "antd";
import { BiSolidDashboard } from "react-icons/bi";
import TitleEditor from "../write/TitleEditor";
import ContentEditor from "../write/ContentEditor";
import { IoClose, IoSave, IoTrash } from "react-icons/io5";
import { FaChevronLeft } from "react-icons/fa6";
import { inputProps } from "../../constant/uiProps";
import { HiOutlineDocumentChartBar } from "react-icons/hi2";

export default function QNA({ dragHandleProps }) {
  // 관리자 여부
  const { user, userLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  // 글 목록
  const [articles, setArticles] = useState([]);
  // 글 목록 로딩
  const [articlesLoading, setArticlesLoading] = useState(false);
  // 글 읽기 모드
  const [readMode, setReadMode] = useState(false);

  // 현재 글
  const [currentArticleLoading, setCurrentArticleLoading] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);

  // 글 수정 모드
  const [title, setTitle] = useState("");
  const [articleContent, setArticleContent] = useState("");

  // 검색어
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user && !userLoading) {
      setIsAdmin(user.email === "rlarnstns@gmail.com");
    }
  }, [user, userLoading]);

  // 글 목록 가져오기
  const fetchArticles = async (searchTerm = "") => {
    setArticlesLoading(true);
    try {
      const response = await fetchDataList("qna", null, searchTerm);
      setArticles(response.content);
    } catch (error) {
      console.error("글 목록 가져오기 실패:", error);
    } finally {
      setArticlesLoading(false);
    }
  };

  // 새 글 생성
  const createNewArticle = async () => {
    try {
      await createData("qna", null);
      await fetchArticles();
    } catch (error) {
      console.error("새 글 생성 실패:", error);
    }
  };
  // 글 가져오기
  const fetchArticle = async (articleId) => {
    setCurrentArticleLoading(true);
    try {
      const response = await fetchData("qna", articleId);
      setCurrentArticle(response.content);
      setTitle(response.content.title);
      setArticleContent(response.content.content || "내용이 없습니다.");
    } catch (error) {
      console.error("글 가져오기 실패:", error);
    } finally {
      setCurrentArticleLoading(false);
    }
  };

  // 글 수정
  const updateArticle = async () => {
    try {
      await updateData("qna", currentArticle._id, {
        title,
        content: articleContent,
      });
      toast.success("글이 수정되었습니다.");
    } catch (error) {
      console.error("글 수정 실패:", error);
      toast.error("글 수정에 실패했습니다.");
    }
  };
  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <WidgetCard
      icon={PiSealQuestionFill}
      title="자주 묻는 질문"
      dragHandleProps={dragHandleProps}
      titleBtn={
        isAdmin ? (
          !readMode ? (
            <Button
              size="sm"
              colorType="text"
              icon={<Plus size={15} />}
              onClick={() => createNewArticle()}
            />
          ) : (
            <div className="flex ">
              <Button
                size="sm"
                colorType="text"
                icon={<IoSave size={15} />}
                onClick={() => updateArticle()}
              />
              <Button
                size="sm"
                colorType="text"
                icon={<IoClose size={15} />}
                onClick={() => {
                  setReadMode(false);
                  setCurrentArticle(null);
                  setTitle("");
                  setArticleContent("");
                  fetchArticles();
                }}
              />
            </div>
          )
        ) : (
          readMode && (
            <Button
              size="sm"
              colorType="text"
              icon={<FaChevronLeft size={15} />}
              onClick={() => {
                setReadMode(false);
                setCurrentArticle(null);
                fetchArticles();
              }}
            />
          )
        )
      }
    >
      {!readMode ? (
        <div className={"w-100 flex flex-col max-h-px-450 gap-10 pd-5 "}>
          {articlesLoading ? (
            <Skeleton active />
          ) : (
            <>
              <Input
                {...inputProps}
                placeholder="검색어를 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onEnter={() => fetchArticles(searchTerm)}
              />
              <List
                dataSource={articles.map((article) => {
                  let title = article.title;
                  if (title.length > 10) {
                    title = title.slice(0, 15) + "...";
                  }

                  return (
                    <div key={article._id}>
                      <div className="flex jus-bet">
                        <div className="flex item-cen gap-5 w-100">
                          <Div color="mint-8">
                            <HiOutlineDocumentChartBar size={17} />
                          </Div>
                          <Typography
                            as="div"
                            pretendard="B"
                            className="cursor-pointer"
                            onDoubleClick={() => {
                              setReadMode(true);
                              setCurrentArticle(article);
                              fetchArticle(article._id);
                            }}
                          >
                            {title}
                          </Typography>
                        </div>
                        {isAdmin && (
                          <Button
                            size="sm"
                            colorType="text"
                            icon={<IoTrash size={15} />}
                            onClick={async () => {
                              await deleteData("qna", article._id);
                              await fetchArticles();
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                virtualScroll={true}
                itemHeight={40}
                overscanCount={5}
                style={{ height: "100%" }}
              />
            </>
          )}
        </div>
      ) : (
        <div className="w-100 flex flex-col gap-10 max-h-px-450 pd-5 overflow-y-auto">
          {currentArticleLoading ? (
            <Skeleton active />
          ) : (
            <div className="flex flex-col gap-10 w-100">
              {/* 제목 */}
              <div>
                {isAdmin ? (
                  <TitleEditor
                    value={currentArticle.title}
                    onChange={(newTitle) => setTitle(newTitle)}
                  />
                ) : (
                  <Typography as="h1" pretendard="B" size="lg">
                    {currentArticle.title}
                  </Typography>
                )}
              </div>
              <Divider style={{ margin: "0" }} />
              {/* 내용 */}
              <div className="tiptap-container prose prose-sm sm:prose-base w-100">
                {isAdmin ? (
                  <ContentEditor
                    value={articleContent}
                    onChange={setArticleContent}
                    autoFocus={true}
                  />
                ) : (
                  <div
                    className="tiptap-container prose prose-sm sm:prose-base"
                    dangerouslySetInnerHTML={{ __html: articleContent }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
