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
  const { setEditor, setSaveAction, setDownloadPDFAction } = useEditorContext();

  const { setting } = useSetting();

  // content 상태는 이제 HTML 문자열을 저장합니다.
  const [content, setContent] = useState(null);

  const debouncedContent = useDebounce(content, setting.autoSaveDelay);

  const editorRef = useRef(null);

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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave]);

  const divStyle = () => {
    if (!document?.docSetting) return {}; // docSetting이 없을 경우 대비

    const widthRatio = 800 / document.docSetting.pageWidth;
    const paddingTop = document.docSetting.paddingTop * widthRatio;
    const paddingBottom = document.docSetting.paddingBottom * widthRatio;
    const paddingLeft = document.docSetting.paddingLeft * widthRatio;
    const paddingRight = document.docSetting.paddingRight * widthRatio;

    // [추가] 화면에 표시될 페이지 한 장의 높이
    const scaledPageHeight = document.docSetting.pageHeight * widthRatio;

    return {
      paddingTop: `${paddingTop}px`,
      paddingBottom: `${paddingBottom}px`,
      paddingLeft: `${paddingLeft}px`,
      paddingRight: `${paddingRight}px`,
      // [추가] 페이지 높이마다 회색 점선을 배경 이미지로 그립니다.
      backgroundImage: `repeating-linear-gradient(
      transparent 0,
      transparent ${scaledPageHeight - 1}px,
      #e0e0e0 ${scaledPageHeight - 1}px,
      #e0e0e0 ${scaledPageHeight}px
    )`,
      // [추가] 배경 이미지의 시작 위치를 상단 여백(paddingTop) 아래로 지정
      backgroundPosition: `0 ${paddingTop}px`
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
        // 1. 화면에 항상 보이는 '편집' 영역
        <Div
          ref={editorRef}
          className="w-px-800 max-w-[90vw] min-h-[100vh] rad-20 shadow-sm"
          background="white-10"
          style={divStyle()}
        >
          <ContentEditor
            value={content}
            onChange={setContent}
            autoFocus={true}
            onEditorCreated={handleEditorCreated}
            bulletStyle={document?.bulletStyle}
          />
        </Div>
      )}
    </div>
  );
}
