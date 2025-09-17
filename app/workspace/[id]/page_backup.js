"use client";

import { useDocument } from "@/app/LIB/context/DocumentContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { Div, DotSpinner, toast } from "sud-ui";
import ContentEditor from "@/app/LIB/components/Write/ContentEditor";
import { useDebounce } from "@/app/LIB/utils/useDebounce";
import { useEditorContext } from "@/app/LIB/context/EditorContext";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useSetting } from "@/app/LIB/context/SettingContext";

export default function WritePage() {
  const { document, saveDocument, loading } = useDocument();
  const { editor, setEditor, setSaveAction, setDownloadPDFAction } =
    useEditorContext();

  const { setting } = useSetting();

  // content 상태는 이제 HTML 문자열을 저장합니다.
  const [content, setContent] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedContent = useDebounce(content, setting.autoSaveDelay);

  const editorRef = useRef(null);

  // HorizontalRule을 이용한 페이지 나누기
  const updatePageBreaks = useCallback(() => {
    if (!editor || typeof window === "undefined") return;

    console.log("📏 [updatePageBreaks] 시작");

    const widthRatio = 800 / document.docSetting.pageWidth;
    const paddingTop = document.docSetting.paddingTop * widthRatio;
    const paddingBottom = document.docSetting.paddingBottom * widthRatio;
    const pageHeight = document.docSetting.pageHeight * widthRatio;
    const contentHeight = pageHeight - paddingTop - paddingBottom;

    console.log("📐 [updatePageBreaks] 계산값:", {
      widthRatio,
      paddingTop,
      paddingBottom,
      pageHeight,
      contentHeight
    });

    // 1. 기존 페이지 구분 HorizontalRule 제거
    const { tr } = editor.state;
    let transaction = tr;

    editor.state.doc.descendants((node, pos) => {
      if (
        node.type.name === "horizontalRule" &&
        node.attrs.class === "page-break"
      ) {
        transaction = transaction.delete(pos, pos + node.nodeSize);
      }
    });

    if (transaction.steps.length > 0) {
      editor.view.dispatch(transaction);
    }

    // 2. DOM을 순회하여 페이지 경계 찾기
    setTimeout(() => {
      const editorElement = editor.view.dom;
      let currentHeight = 0;
      let pageNumber = 1;
      const insertPositions = [];

      Array.from(editorElement.children).forEach((element, index) => {
        const elementHeight = element.offsetHeight;

        console.log(
          `� [updatePageBreaks] 요소 ${index}: 높이=${elementHeight}, 누적=${
            currentHeight + elementHeight
          }, 제한=${contentHeight}`
        );

        if (
          currentHeight + elementHeight > contentHeight &&
          currentHeight > 0
        ) {
          // 페이지 경계를 넘으면 위치 기록
          pageNumber++;
          console.log(
            `🔄 [updatePageBreaks] 페이지 ${pageNumber} 구분점 - 요소 ${index} 앞`
          );

          // TipTap 문서에서의 실제 위치 계산
          const pos = editor.view.posAtDOM(element, 0);
          insertPositions.push(pos);

          currentHeight = elementHeight;
        } else {
          currentHeight += elementHeight;
        }
      });

      console.log(
        `📊 [updatePageBreaks] 총 ${pageNumber}페이지, 구분점 ${insertPositions.length}개`
      );

      // 3. HorizontalRule 삽입 (뒤에서부터 삽입하여 위치 변경 방지)
      let newTransaction = editor.state.tr;
      insertPositions.reverse().forEach((pos, index) => {
        newTransaction = newTransaction.insert(
          pos,
          editor.schema.nodes.horizontalRule.create({ class: "page-break" })
        );
      });

      if (newTransaction.steps.length > 0) {
        editor.view.dispatch(newTransaction);
      }

      // 4. 총 페이지 수 업데이트
      setTotalPages(pageNumber);
      console.log(`✅ [updatePageBreaks] 완료 - 총 ${pageNumber}페이지`);
    }, 100);
  }, [editor, document?.docSetting]);

  // 컨텐츠 변경시 페이지 나누기 업데이트
  useEffect(() => {
    if (!document?.docSetting || !editor || !content) {
      setTotalPages(1);
      return;
    }

    // 컨텐츠 변경 후 약간의 딜레이를 두고 계산 (DOM 업데이트 대기)
    const timer = setTimeout(updatePageBreaks, 100);
    return () => clearTimeout(timer);
  }, [content, document?.docSetting, editor, updatePageBreaks]);

  // 자동 저장 로직 (HTML 기준)
  useEffect(() => {
    if (!setting.autoSave) return; // 자동 저장이 비활성화된 경우 아무 작업도 하지 않음
    if (
      !loading &&
      debouncedContent !== null &&
      document?.content !== undefined
    ) {
      // HTML 문자열을 직접 비교하여 변경되었을 때만 저장
      if (debouncedContent !== document.content) {
        saveDocument(document._id, { ...document, content: debouncedContent });
      }
    }
  }, [debouncedContent, document, saveDocument, loading, setting.autoSave]);

  // 문서 로딩 로직 (HTML 기준)
  useEffect(() => {
    if (document?.content) {
      setContent(document.content);
    } else if (document) {
      // 콘텐츠가 없는 새 문서는 빈 문자열로 시작
      setContent("");
    }
  }, [document]);

  const handleSave = useCallback(() => {
    // 즉시 저장 로직
    if (document && content !== null) {
      saveDocument(document._id, { ...document, content });
      toast.success("저장되었습니다!"); // 사용자 피드백
    }
  }, [document, content, saveDocument]);

  const handleDownloadPDF = useCallback(async () => {
    const editorElement = editorRef.current;
    if (!editorElement || !content) {
      toast.error("다운로드할 콘텐츠가 없습니다.");
      return;
    }

    try {
      toast.loading("다운로드 중...");
      const canvas = await html2canvas(editorElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // A4 사이즈: 210mm x 297mm
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 가로 길이
      const pageHeight = 297; // A4 세로 길이
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // 첫 페이지 추가
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 콘텐츠가 한 페이지를 넘을 경우, 새 페이지를 추가하고 이미지를 잘라 넣습니다.
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = document?.title
        ? `${document.title}.pdf`
        : "document.pdf";
      pdf.save(fileName);
      toast.success("PDF 파일이 다운로드되었습니다!");
    } catch (error) {
      console.error("PDF 생성 오류:", error);
      toast.error("PDF 생성 중 오류가 발생했습니다.");
    }
  }, [content, document?.title]);

  useEffect(() => {
    setSaveAction(() => handleSave);
    setDownloadPDFAction(() => handleDownloadPDF);

    return () => {
      setSaveAction(null);
      setDownloadPDFAction(null);
    };
  }, [handleSave, handleDownloadPDF, setSaveAction, setDownloadPDFAction]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isCtrlOrCmd = event.metaKey || event.ctrlKey;

      // Ctrl+S 저장 로직 추가
      if (isCtrlOrCmd && event.key === "s") {
        event.preventDefault(); // 브라우저 기본 저장 동작 방지
        handleSave(); // 저장 함수 호출
      }

      // PageUp/PageDown 키로 페이지 네비게이션
      if (event.key === "PageDown") {
        event.preventDefault();
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
      } else if (event.key === "PageUp") {
        event.preventDefault();
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave, totalPages]);

  const divStyle = () => {
    if (!document?.docSetting) return {}; // docSetting이 없을 경우 대비

    const widthRatio = 800 / document.docSetting.pageWidth;
    const paddingTop = document.docSetting.paddingTop * widthRatio;
    const paddingBottom = document.docSetting.paddingBottom * widthRatio;
    const paddingLeft = document.docSetting.paddingLeft * widthRatio;
    const paddingRight = document.docSetting.paddingRight * widthRatio;

    // 실제 용지 높이 계산
    const pageHeight = document.docSetting.pageHeight * widthRatio;

    return {
      paddingTop: `${paddingTop}px`,
      paddingBottom: `${paddingBottom}px`,
      paddingLeft: `${paddingLeft}px`,
      paddingRight: `${paddingRight}px`,
      minHeight: `${pageHeight}px`
    };
  };

  // 현재 페이지에 맞는 요소들만 표시
  useEffect(() => {
    if (!editor || typeof window === "undefined") return;

    console.log(
      "🎨 [CSS업데이트] 현재 페이지:",
      currentPage,
      "/ 총 페이지:",
      totalPages
    );

    // CSS 스타일 동적 생성
    const styleId = "page-visibility-style";
    let styleElement = window.document.getElementById(styleId);

    if (!styleElement) {
      styleElement = window.document.createElement("style");
      styleElement.id = styleId;
      window.document.head.appendChild(styleElement);
      console.log("🎨 [CSS업데이트] 새 스타일 요소 생성");
    }

    // HorizontalRule을 기준으로 페이지 나누기
    let css = `
      .ProseMirror > * {
        display: none !important;
      }
    `;

    if (currentPage === 1) {
      // 첫 번째 페이지: 처음부터 첫 번째 page-break까지
      css += `
        .ProseMirror > *:first-child,
        .ProseMirror > *:first-child ~ *:not(hr[class="page-break"]) {
          display: block !important;
        }
        .ProseMirror > hr[class="page-break"]:first-of-type ~ * {
          display: none !important;
        }
      `;
    } else {
      // 이후 페이지들: n번째 page-break부터 (n+1)번째 page-break까지
      const nthPageBreak = currentPage - 1;
      const nextPageBreak = currentPage;

      css += `
        .ProseMirror > hr[class="page-break"]:nth-of-type(${nthPageBreak}) ~ *:not(hr[class="page-break"]) {
          display: block !important;
        }
        .ProseMirror > hr[class="page-break"]:nth-of-type(${nextPageBreak}) ~ * {
          display: none !important;
        }
      `;
    }

    styleElement.textContent = css;
    console.log("🎨 [CSS업데이트] HorizontalRule 기반 CSS 적용 완료");

    return () => {
      // 컴포넌트 언마운트시 스타일 제거
      if (styleElement && window.document.head.contains(styleElement)) {
        window.document.head.removeChild(styleElement);
      }
    };
  }, [currentPage, editor, totalPages]); // totalPages 의존성 추가

  const contentStyle = () => {
    return {
      width: "100%",
      position: "relative"
    };
  };

  const handleEditorCreated = useCallback(
    (editor) => {
      if (editor && editor.view) {
        setEditor(editor);
      }
    },
    [setEditor]
  );

  return (
    <div className="flex flex-col items-center justify-center gap-10 pd-y-10">
      {loading || content === null ? (
        <DotSpinner />
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* 페이지 네비게이션 정보 */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              이전
            </button>
            <span>
              {currentPage} / {totalPages} 페이지
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              다음
            </button>
          </div>

          {/* 페이지 마커 기반 에디터 영역 */}
          <div
            className="w-px-800 max-w-[90vw] rad-20 shadow-sm"
            style={{
              backgroundColor: "white",
              position: "relative",
              height: document?.docSetting
                ? `${
                    (document.docSetting.pageHeight * 800) /
                    document.docSetting.pageWidth
                  }px`
                : "842px" // A4 기본 높이
            }}
          >
            {/* 외부 Div: 여백(패딩) 표시용 */}
            <Div
              background="white-10"
              style={{ ...divStyle(), position: "relative" }}
            >
              {/* 내부 Div: 컨텐츠 영역 */}
              <div
                ref={editorRef}
                style={{ ...contentStyle(), position: "relative" }}
              >
                <ContentEditor
                  value={content}
                  onChange={setContent}
                  autoFocus={true}
                  onEditorCreated={handleEditorCreated}
                  bulletStyle={document?.bulletStyle}
                />
              </div>
            </Div>
          </div>
        </div>
      )}
    </div>
  );
}
