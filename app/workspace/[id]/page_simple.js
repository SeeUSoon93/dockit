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

  // 📄 간단한 페이지 계산: HorizontalRule 개수만 세기
  const calculatePages = useCallback(() => {
    if (!editor) return;

    let pageCount = 1; // 첫 번째 페이지
    
    // HorizontalRule 개수 세기
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'horizontalRule') {
        pageCount++;
      }
    });

    console.log(`📊 총 ${pageCount}페이지`);
    setTotalPages(pageCount);
  }, [editor]);

  // 컨텐츠 변경시 페이지 수 재계산
  useEffect(() => {
    if (!editor) return;
    
    const timer = setTimeout(calculatePages, 100);
    return () => clearTimeout(timer);
  }, [content, editor, calculatePages]);

  // HorizontalRule 기반 페이지 표시
  useEffect(() => {
    if (!editor || typeof window === "undefined") return;

    console.log(`🎨 페이지 ${currentPage} 표시`);

    // CSS 스타일 동적 생성
    const styleId = "page-visibility-style";
    let styleElement = window.document.getElementById(styleId);

    if (!styleElement) {
      styleElement = window.document.createElement("style");
      styleElement.id = styleId;
      window.document.head.appendChild(styleElement);
    }

    // HorizontalRule을 기준으로 페이지 나누기
    let css = '';

    if (currentPage === 1) {
      // 첫 번째 페이지: 첫 번째 HR까지만 표시
      css = `
        .ProseMirror > * {
          display: block !important;
        }
        .ProseMirror > hr:first-of-type ~ * {
          display: none !important;
        }
      `;
    } else {
      // 다른 페이지들: n번째 HR부터 (n+1)번째 HR까지 표시
      const prevHR = currentPage - 1;
      const nextHR = currentPage;
      
      css = `
        .ProseMirror > * {
          display: none !important;
        }
        .ProseMirror > hr:nth-of-type(${prevHR}) ~ *:not(hr) {
          display: block !important;
        }
        .ProseMirror > hr:nth-of-type(${nextHR}) ~ * {
          display: none !important;
        }
      `;
    }

    styleElement.textContent = css;

    return () => {
      if (styleElement && window.document.head.contains(styleElement)) {
        window.document.head.removeChild(styleElement);
      }
    };
  }, [currentPage, editor, totalPages]);

  // 자동 저장 로직 (HTML 기준)
  useEffect(() => {
    if (!setting.autoSave) return;
    if (
      !loading &&
      debouncedContent !== null &&
      document?.content !== undefined
    ) {
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
      setContent("");
    }
  }, [document]);

  const handleSave = useCallback(() => {
    if (document && content !== null) {
      saveDocument(document._id, { ...document, content });
      toast.success("저장되었습니다!");
    }
  }, [document, content, saveDocument]);

  const handleDownloadPDF = useCallback(async () => {
    const editorElement = editorRef.current;
    if (!editorElement || !content) {
      toast.error("다운로드할 콘텐츠가 없습니다.");
      return;
    }

    try {
      const canvas = await html2canvas(editorElement);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${document?.title || "문서"}.pdf`);
      toast.success("PDF 다운로드가 완료되었습니다!");
    } catch (error) {
      console.error("PDF 생성 오류:", error);
      toast.error("PDF 생성에 실패했습니다.");
    }
  }, [content, document?.title]);

  useEffect(() => {
    setSaveAction(() => handleSave);
    setDownloadPDFAction(() => handleDownloadPDF);
  }, [handleSave, handleDownloadPDF, setSaveAction, setDownloadPDFAction]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const divStyle = () => {
    const widthRatio = 800 / document.docSetting.pageWidth;
    const paddingTop = document.docSetting.paddingTop * widthRatio;
    const paddingBottom = document.docSetting.paddingBottom * widthRatio;
    const paddingLeft = document.docSetting.paddingLeft * widthRatio;
    const paddingRight = document.docSetting.paddingRight * widthRatio;
    const pageHeight = document.docSetting.pageHeight * widthRatio;

    return {
      paddingTop: `${paddingTop}px`,
      paddingBottom: `${paddingBottom}px`,
      paddingLeft: `${paddingLeft}px`,
      paddingRight: `${paddingRight}px`,
      minHeight: `${pageHeight}px`
    };
  };

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
          {/* 페이지 네비게이션 */}
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

          {/* 페이지 구분선 추가 버튼 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              ➕ 페이지 나누기
            </button>
            <span className="text-xs text-gray-500">
              페이지를 나누고 싶은 곳에서 클릭하세요
            </span>
          </div>

          {/* 에디터 영역 */}
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
                : "842px"
            }}
          >
            <Div
              background="white-10"
              style={{ ...divStyle(), position: "relative" }}
            >
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
