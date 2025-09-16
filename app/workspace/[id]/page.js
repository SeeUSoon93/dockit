"use client";

import { useDocument } from "@/app/LIB/context/DocumentContext";
import { useCallback, useEffect, useState } from "react";
import { Div, DotSpinner, toast } from "sud-ui";
import ContentEditor from "@/app/LIB/components/Write/ContentEditor";
import PrintCardPortal from "./PrintCardPortal";
import { useDebounce } from "@/app/LIB/utils/useDebounce";
import { useEditorContext } from "@/app/LIB/context/EditorContext";

// 인쇄될 내용을 표시하는 간단한 컴포넌트
function PrintableContent({ htmlContent, docSetting }) {
  // [추가] docSetting을 기반으로 인쇄용 스타일 객체 생성
  const printStyle = {
    paddingTop: `${docSetting.paddingTop}mm`,
    paddingBottom: `${docSetting.paddingBottom}mm`,
    paddingLeft: `${docSetting.paddingLeft}mm`,
    paddingRight: `${docSetting.paddingRight}mm`,
    width: `${docSetting.pageWidth}mm`,
    boxSizing: "border-box" // 패딩이 너비/높이에 포함되도록 설정
  };

  return (
    <div
      className="print-card prose prose-sm sm:prose-base"
      style={printStyle} // [수정] 인라인 스타일 적용
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

export default function WritePage() {
  const { document, saveDocument, loading } = useDocument();
  const { setEditor, setPrintAction, setSaveAction, editor } =
    useEditorContext();

  // content 상태는 이제 HTML 문자열을 저장합니다.
  const [content, setContent] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const debouncedContent = useDebounce(content, 10000);

  // 자동 저장 로직 (HTML 기준)
  useEffect(() => {
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
  }, [debouncedContent, document, saveDocument, loading]);

  // 문서 로딩 로직 (HTML 기준)
  useEffect(() => {
    if (document?.content) {
      setContent(document.content);
    } else if (document) {
      // 콘텐츠가 없는 새 문서는 빈 문자열로 시작
      setContent("");
    }
  }, [document]);

  // isPrinting 상태가 true로 바뀌면 인쇄 실행
  useEffect(() => {
    if (isPrinting) {
      // setTimeout으로 감싸서 React가 DOM을 업데이트할 시간을 줍니다.
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 100); // 딜레이를 0으로 주어도 이벤트 루프의 다음 틱으로 넘어가기 때문에 충분합니다.
    }
  }, [isPrinting]);
  // 1. 인쇄와 저장 핸들러를 정의합니다.
  const handlePrint = () => {
    setIsPrinting(true);
  };

  const handleSave = useCallback(() => {
    // 즉시 저장 로직
    if (document && content !== null) {
      saveDocument(document._id, { ...document, content });
      toast.success("저장되었습니다!"); // 사용자 피드백
    }
  }, [document, content, saveDocument]);
  useEffect(() => {
    // 함수 자체를 넘겨주어 Context에 등록
    setPrintAction(() => handlePrint);
    setSaveAction(() => handleSave);

    // 컴포넌트가 사라질 때 등록된 함수를 정리합니다.
    return () => {
      setPrintAction(null);
      setSaveAction(null);
    };
  }, [document, content]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isCtrlOrCmd = event.metaKey || event.ctrlKey;

      // Ctrl+S 저장 로직 추가
      if (isCtrlOrCmd && event.key === "s") {
        event.preventDefault(); // 브라우저 기본 저장 동작 방지
        handleSave(); // 저장 함수 호출
      }
      // 기존 Ctrl+P 인쇄 로직
      else if (isCtrlOrCmd && event.key === "p") {
        event.preventDefault();
        setIsPrinting(true);
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

  return isPrinting ? (
    <PrintCardPortal>
      <PrintableContent
        htmlContent={content}
        docSetting={document.docSetting}
      />
    </PrintCardPortal>
  ) : (
    <div className="flex flex-col items-center justify-center gap-10 pd-y-10">
      {loading || content === null ? (
        <DotSpinner />
      ) : (
        // 1. 화면에 항상 보이는 '편집' 영역
        <Div
          className="w-px-800 max-w-[90vw] min-h-[100vh] rad-20 shadow-sm"
          background="white-10"
          style={divStyle()}
        >
          <ContentEditor
            value={content}
            onChange={setContent}
            autoFocus={true}
            onEditorCreated={setEditor}
          />
        </Div>
      )}
    </div>
  );
}
