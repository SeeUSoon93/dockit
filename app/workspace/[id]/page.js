"use client";

import { useDocument } from "@/app/LIB/context/DocumentContext";
import { useSetting } from "@/app/LIB/context/SettingContext";
import { useDebounce } from "@/app/LIB/utils/useDebounce";
import { useEffect, useState, useMemo, useRef } from "react";
import { Div, DotSpinner } from "sud-ui";
import ContentEditor from "@/app/LIB/components/Write/ContentEditor";
import {
  splitContentByPageBreak,
  joinContentPages
} from "@/app/LIB/utils/tiptapUtils";

export default function WritePage() {
  const { document, saveDocument, loading } = useDocument();
  const { setting } = useSetting();

  // 1. 페이지별로 나뉜 콘텐츠(JSON 객체)를 담는 로컬 state
  const [pages, setPages] = useState([]);
  const pageRefs = useRef([]); // 각 페이지 DOM 요소에 접근하기 위한 ref

  // 2. 디바운싱된 pages가 변경되면, 하나로 합쳐서 저장하는 로직
  const debouncedPages = useDebounce(pages, 2000);
  useEffect(() => {
    if (!loading && pages.length > 0 && document?.content) {
      const fullContentJSON = joinContentPages(debouncedPages);
      if (
        JSON.stringify(fullContentJSON) !== JSON.stringify(document.content)
      ) {
        saveDocument(document._id, { ...document, content: fullContentJSON });
      }
    }
  }, [debouncedPages, document, saveDocument, loading]);

  // 3. Context에서 document를 불러오면, 페이지 배열 state를 초기화
  useEffect(() => {
    if (document?.content) {
      const pageContents = splitContentByPageBreak(document.content);
      setPages(pageContents);
    } else if (document) {
      // 콘텐츠가 없는 새 문서
      setPages([{ type: "doc", content: [] }]);
    }
  }, [document]);

  // 4. 페이지 오버플로우를 감지하고 페이지를 나누는 핵심 로직
  useEffect(() => {
    // 마지막 페이지에서만 오버플로우를 체크
    const lastPageIndex = pages.length - 1;
    const lastPageElement = pageRefs.current[lastPageIndex];

    if (
      lastPageElement &&
      lastPageElement.scrollHeight > lastPageElement.clientHeight
    ) {
      const editorElement = lastPageElement.querySelector(".ProseMirror");
      if (!editorElement) return;

      let overflowIndex = -1;

      // 마지막 노드부터 거꾸로 탐색하며 페이지를 넘어가는 첫 노드를 찾음
      for (let i = editorElement.childNodes.length - 1; i >= 0; i--) {
        const node = editorElement.childNodes[i];
        if (node.offsetTop + node.offsetHeight > lastPageElement.clientHeight) {
          overflowIndex = i;
        } else {
          break;
        }
      }

      if (overflowIndex > -1) {
        const lastPageContent = pages[lastPageIndex];
        if (!lastPageContent || !lastPageContent.content) return;

        // 넘어간 노드부터 끝까지를 잘라내어 새 페이지로 만듦
        const nodesToMove = lastPageContent.content.slice(overflowIndex);
        const currentPageNodes = lastPageContent.content.slice(
          0,
          overflowIndex
        );

        // 무한 루프를 방지하기 위해, 실제로 옮길 노드가 있을 때만 state 업데이트
        if (nodesToMove.length > 0) {
          setPages((currentPages) => {
            const newPages = [...currentPages];
            newPages[lastPageIndex] = {
              ...newPages[lastPageIndex],
              content: currentPageNodes
            };
            newPages.push({ type: "doc", content: nodesToMove });
            return newPages;
          });
        }
      }
    }
  }, [pages]); // pages state가 변경될 때마다 이 로직 실행

  // 특정 페이지의 내용이 변경될 때 state 업데이트
  const handlePageChange = (updatedPageContent, pageIndex) => {
    const newPages = pages.map((page, index) =>
      index === pageIndex ? updatedPageContent : page
    );
    setPages(newPages);
  };

  const pageStyles = useMemo(() => {
    const pageWidth = 800; // px
    const scaleFactor = pageWidth / setting.pageSize.width;
    const pageHeight = setting.pageSize.height * scaleFactor;
    return {
      width: `${pageWidth}px`,
      height: `${pageHeight}px`,
      paddingTop: `${setting.pagePadding.top * scaleFactor}px`,
      paddingBottom: `${setting.pagePadding.bottom * scaleFactor}px`,
      paddingLeft: `${setting.pagePadding.left * scaleFactor}px`,
      paddingRight: `${setting.pagePadding.right * scaleFactor}px`
    };
  }, [setting]);

  return (
    <div className="flex flex-col items-center justify-center gap-10 pd-y-50">
      {loading || pages.length === 0 ? (
        <DotSpinner />
      ) : (
        pages.map((pageContent, index) => (
          <Div
            ref={(el) => (pageRefs.current[index] = el)}
            key={index}
            className={`aspect-[${setting.pageSize.width}/${setting.pageSize.height}] shadow-md`}
            background="white-10"
            style={{ ...pageStyles, overflow: "hidden" }}
          >
            <ContentEditor
              value={pageContent}
              onChange={(newContent) => handlePageChange(newContent, index)}
              autoFocus={index === pages.length - 1} // 마지막 페이지만 자동 포커스
            />
          </Div>
        ))
      )}
    </div>
  );
}
