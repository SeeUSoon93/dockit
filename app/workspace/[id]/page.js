"use client";

import { useDocument } from "@/app/LIB/context/DocumentContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { Div, DotSpinner, toast } from "sud-ui";
import ContentEditor from "@/app/LIB/components/Write/ContentEditor";
import { useDebounce } from "@/app/LIB/utils/useDebounce";
import { useEditorContext } from "@/app/LIB/context/EditorContext";

import { useSetting } from "@/app/LIB/context/SettingContext";

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
    title
  } = useDocument();
  const { setEditor, setSaveAction, setDownloadPDFAction } = useEditorContext();

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
      // --- ⬇️ PDF 생성을 위한 HTML 준비 과정 (추가된 부분) ⬇️ ---

      // 1. 현재 페이지에 적용된 모든 <style>과 <link rel="stylesheet"> 태그를 가져옵니다.
      const styleTags = Array.from(
        window.document.querySelectorAll('style, link[rel="stylesheet"]')
      )
        .map((tag) => tag.outerHTML)
        .join("");

      // 2. body에 들어갈 내용(content)과 위에서 찾은 스타일을 합쳐 완전한 HTML 문서를 만듭니다.
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

      // --- ⬆️ HTML 준비 과정 끝 ⬆️ ---

      // 4. 준비된 HTML을 API로 전송하여 PDF를 생성합니다.
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          html: finalHtml, // 스타일이 모두 포함된 최종 HTML 전달
          settings: {
            pageWidth: 210,
            pageHeight: 297,
            paddingTop: 25.4,
            paddingBottom: 25.4,
            paddingLeft: 25.4,
            paddingRight: 25.4
          }
        })
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
  }, [content, title]);

  useEffect(() => {
    setSaveAction(() => handleSave);
    setDownloadPDFAction(() => handleDownloadPDF);

    return () => {
      setSaveAction(null);
      setDownloadPDFAction(null);
    };
  }, [handleSave, setSaveAction, setDownloadPDFAction, handleDownloadPDF]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isCtrlOrCmd = event.metaKey || event.ctrlKey;

      // Ctrl+S 저장
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
    if (!docSetting) return {}; // docSetting이 없을 경우 대비

    const widthRatio = 800 / docSetting.pageWidth;
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
      minHeight: `${pageHeight}px`
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
  if (!mounted) {
    return;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-10 pd-y-10">
      {loading || content === null ? (
        <DotSpinner />
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* 외부 Div: 여백(패딩) 표시용 */}
          <Div
            background="white-10"
            className="shadow-sm w-[800px]"
            style={{ ...divStyle() }}
          >
            <ContentEditor
              value={content}
              onChange={setContent}
              autoFocus={true}
              onEditorCreated={handleEditorCreated}
              bulletStyle={bulletStyle}
            />
          </Div>
        </div>
      )}
    </div>
  );
}
