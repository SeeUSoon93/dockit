"use client";

import { useDocument } from "@/app/LIB/context/DocumentContext";
import { useCallback, useEffect, useState } from "react";
import { Div, DotSpinner, toast } from "sud-ui";
import ContentEditor from "@/app/LIB/components/write/ContentEditor";
import { useDebounce } from "@/app/LIB/hook/useDebounce";
import { useEditorContext } from "@/app/LIB/context/EditorContext";

import { useSetting } from "@/app/LIB/context/SettingContext";
import { useLayout } from "@/app/LIB/context/LayoutContext";

// 외부 CSS 파일 내용을 가져와 <style> 태그로 바꿔주는 헬퍼 함수
async function inlineCssStyles(htmlString) {
  // DOMParser를 사용해 문자열을 실제 HTML 문서처럼 다룰 수 있게 합니다.
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // 문서 안의 모든 <link rel="stylesheet"> 태그를 찾습니다.
  const links = doc.querySelectorAll('link[rel="stylesheet"]');

  for (const link of links) {
    const href = link.getAttribute("href");
    if (href) {
      try {
        // CSS 파일의 내용을 fetch로 가져옵니다.
        // href가 상대경로일 경우를 대비해 절대경로로 만들어줍니다.
        const response = await fetch(new URL(href, window.location.href));
        const cssText = await response.text();

        // 새로운 <style> 태그를 만듭니다.
        const style = doc.createElement("style");
        style.textContent = cssText;

        // 기존 <link> 태그를 새로운 <style> 태그로 교체합니다.
        link.parentNode.replaceChild(style, link);
      } catch (error) {
        console.error(`CSS 파일을 가져오는 데 실패했습니다: ${href}`, error);
      }
    }
  }
  // 수정된 문서의 전체 HTML을 문자열로 반환합니다.
  return doc.documentElement.outerHTML;
}

export default function WritePage() {
  const {
    document,
    saveDocument,
    docSetting,
    loading,
    content,
    bulletStyle,
    setContent,
    title,
  } = useDocument();
  const {
    setSaveAction,
    setDownloadPDFAction,
    editor,
    setPrintAction,
    setDownloadHTMLAction,
  } = useEditorContext();
  const { layoutMode } = useLayout();
  const { setting } = useSetting();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const debouncedContent = useDebounce(content, setting.autoSaveDelay);

  // 자동 저장
  useEffect(() => {
    if (!setting.autoSave) return;

    if (document && debouncedContent && debouncedContent !== document.content) {
      saveDocument(document._id, { content: debouncedContent });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent, setting.autoSave]);

  const handleSave = useCallback(() => {
    // 즉시 저장 로직
    if (document && content !== null) {
      saveDocument(document._id, { content: content });
      toast.success("저장되었습니다!");
    }
  }, [document, content, saveDocument]);

  // PDF 다운로드 핸들러 함수
  const handleDownloadPDF = useCallback(async () => {
    toast.info("PDF 생성 중입니다. 잠시만 기다려주세요...");
    try {
      const styleTags = Array.from(
        window.document.querySelectorAll('style, link[rel="stylesheet"]')
      )
        .map((tag) => tag.outerHTML)
        .join("");

      const combinedHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          ${styleTags}
        </head>
        <body>
          <div class="tiptap-container">
            ${content}
          </div>
        </body>
      </html>
    `;

      // 3. <link> 태그로 연결된 외부 CSS 내용을 <style> 태그 안으로 모두 넣어줍니다.
      const finalHtml = await inlineCssStyles(combinedHtml);

      // 4. 준비된 HTML을 API로 전송하여 PDF를 생성합니다.
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: finalHtml, // 스타일이 모두 포함된 최종 HTML 전달
          settings: {
            pageWidth: docSetting?.pageWidth || 210,
            pageHeight: docSetting?.pageHeight || 297,
            paddingTop: docSetting?.paddingTop || 25.4,
            paddingBottom: docSetting?.paddingBottom || 25.4,
            paddingLeft: docSetting?.paddingLeft || 25.4,
            paddingRight: docSetting?.paddingRight || 25.4,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("PDF 생성에 실패했습니다.");
      }

      // --- 기존과 동일한 다운로드 로직 ---
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = title + ".pdf";
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.danger("PDF를 다운로드하는 중 오류가 발생했습니다.");
    }
  }, [content, title, docSetting]);

  const handleDownloadHTML = useCallback(async () => {
    if (!content || !title) {
      toast.error("내용이 없습니다.");
      return;
    }

    toast.info("HTML 생성 중입니다. 잠시만 기다려주세요...");

    try {
      // 현재 페이지의 스타일을 가져오기
      const styleTags = Array.from(
        typeof window !== "undefined"
          ? window.document.querySelectorAll('style, link[rel="stylesheet"]')
          : []
      )
        .map((tag) => tag.outerHTML)
        .join("");

      // HTML 문서 생성
      const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${styleTags}
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    .document-content {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="document-content">
    <h1>${title}</h1>
    ${content}
  </div>
</body>
</html>`;

      // Blob 생성 및 다운로드
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9가-힣]/g, "_")}.html`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("HTML 파일이 다운로드되었습니다!");
    } catch (error) {
      console.error("HTML 다운로드 실패:", error);
      toast.error("HTML 다운로드에 실패했습니다.");
    }
  }, [content, title]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    setSaveAction(() => handleSave);
    setDownloadPDFAction(() => handleDownloadPDF);
    setDownloadHTMLAction(() => handleDownloadHTML);
    setPrintAction(() => handlePrint);

    return () => {
      setSaveAction(null);
      setDownloadPDFAction(null);
      setDownloadHTMLAction(null);
      setPrintAction(null);
    };
  }, [
    handleSave,
    setSaveAction,
    setDownloadPDFAction,
    handleDownloadPDF,
    setDownloadHTMLAction,
    handleDownloadHTML,
    setPrintAction,
    handlePrint,
  ]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isCtrlOrCmd = event.metaKey || event.ctrlKey;

      if (isCtrlOrCmd && event.key === "s") {
        event.preventDefault(); // 브라우저 기본 저장 동작 방지
        handleSave(); // 저장 함수 호출
      }

      // ✨ [수정] 서식 복사/붙여넣기 단축키
      if (isCtrlOrCmd && event.shiftKey) {
        // 서식 복사: Ctrl + Shift + C
        if (event.key.toLowerCase() === "c") {
          event.preventDefault();
          editor?.commands.copyFormat();
          toast.info("서식이 복사되었습니다.");
        }
        // 서식 붙여넣기: Ctrl + Shift + V
        if (event.key.toLowerCase() === "v") {
          event.preventDefault();
          editor?.commands.pasteFormat();
        }
      } // ✨ [추가] Ctrl+P 인쇄 단축키
      if (isCtrlOrCmd && event.key.toLowerCase() === "p") {
        event.preventDefault(); // 브라우저의 기본 인쇄 동작을 막습니다.
        handlePrint();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave, editor, handlePrint, layoutMode]);

  useEffect(() => {
    // docSetting이 없으면 아무것도 하지 않음
    if (!docSetting) return;

    // 1. 동적으로 생성할 CSS 규칙을 문자열로 만듭니다.
    const pageStyle = `
      @media print {
        @page {
          /* 용지 크기를 설정합니다. */
          size: ${docSetting.pageWidth}mm ${docSetting.pageHeight}mm;
          /* 용지 여백을 설정합니다. */
          margin: ${docSetting.paddingTop}mm ${docSetting.paddingRight}mm ${docSetting.paddingBottom}mm ${docSetting.paddingLeft}mm;
        }
      }
    `;

    // 2. 이 스타일을 담을 <style> 태그를 찾거나 새로 만듭니다.
    let styleTag = window.document.getElementById("dynamic-page-style");
    if (!styleTag) {
      styleTag = window.document.createElement("style");
      styleTag.id = "dynamic-page-style";
      window.document.head.appendChild(styleTag);
    }

    // 3. <style> 태그의 내용으로 우리가 만든 CSS 규칙을 넣어줍니다.
    styleTag.textContent = pageStyle;

    // 4. 컴포넌트가 사라질 때 생성했던 <style> 태그를 정리합니다.
    return () => {
      styleTag.remove();
    };
  }, [docSetting]);

  const divStyle = () => {
    if (!docSetting) return {}; // docSetting이 없을 경우 대비
    const currentVwInPx = window.innerWidth;
    const width =
      layoutMode === "mobile"
        ? currentVwInPx - 20
        : setting.workspaceWidth || 800;

    const widthRatio = width / docSetting.pageWidth;
    const paddingTop = docSetting.paddingTop * widthRatio;
    const paddingBottom = docSetting.paddingBottom * widthRatio;
    const paddingLeft = docSetting.paddingLeft * widthRatio;
    const paddingRight = docSetting.paddingRight * widthRatio;

    // 실제 용지 높이 계산
    const pageHeight = docSetting.pageHeight * widthRatio;

    return {
      paddingTop: `${paddingTop}px`,
      paddingBottom: `${paddingBottom}px`,
      paddingLeft: `${paddingLeft}px`,
      paddingRight: `${paddingRight}px`,
      minHeight: `${pageHeight}px`,
      width: `${width}px`,
    };
  };

  if (!mounted) {
    return null;
  }

  return (
    <Div className="flex flex-col items-center justify-center gap-10 pd-y-50">
      {loading || content === null ? (
        <DotSpinner />
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* 외부 Div: 여백(패딩) 표시용 */}
          <Div
            background="white-10"
            className={`shadow-sm`}
            id="paper-wrapper"
            style={{ ...divStyle() }}
          >
            <ContentEditor
              value={content}
              onChange={setContent}
              autoFocus={true}
              bulletStyle={bulletStyle}
            />
          </Div>
        </div>
      )}
    </Div>
  );
}
