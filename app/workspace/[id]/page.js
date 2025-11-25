"use client";

import { useDocument } from "@/app/LIB/context/DocumentContext";
import { useCallback, useEffect, useState } from "react";
import { Div, DotSpinner, toast } from "sud-ui";
import ContentEditor from "@/app/LIB/components/write/ContentEditor";
import { useDebounce } from "@/app/LIB/hook/useDebounce";
import { useEditorContext } from "@/app/LIB/context/EditorContext";

import { useSetting } from "@/app/LIB/context/SettingContext";
import { useLayout } from "@/app/LIB/context/LayoutContext";
import "katex/dist/katex.min.css";
import { generateStyleSet } from "@/app/LIB/utils/pdfUtils";

const NODE_URL = process.env.NEXT_PUBLIC_NODE_URL;
const API_KEY = process.env.NEXT_PUBLIC_PUPPETEER_API_KEY;

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
  const { setSaveAction, setDownloadPDFAction, editor, setPrintAction } =
    useEditorContext();
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

  const handleSave = useCallback(async () => {
    // 즉시 저장 로직
    if (document && content !== null) {
      await saveDocument(document._id, { content: content });
      toast.success("저장되었습니다!");
    }
  }, [document, content, saveDocument]);

  // PDF 다운로드 핸들러 함수
  const handleDownloadPDF = useCallback(async () => {
    toast.info("PDF 생성 중입니다. 생성 후 자동으로 다운로드 됩니다.");

    try {
      const finalHtml = await generateStyleSet(
        bulletStyle,
        docSetting,
        content
      );

      const response = await fetch(`${NODE_URL}/api/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`, // 👈 인증 헤더 추가
        },
        body: JSON.stringify({
          html: finalHtml,
          settings: {
            pageWidth: docSetting?.pageWidth || 210,
            pageHeight: docSetting?.pageHeight || 297,
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
  }, [content, title, docSetting, bulletStyle]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    setSaveAction(() => handleSave);
    setDownloadPDFAction(() => handleDownloadPDF);
    setPrintAction(() => handlePrint);

    return () => {
      setSaveAction(null);
      setDownloadPDFAction(null);
      setPrintAction(null);
    };
  }, [
    handleSave,
    setSaveAction,
    setDownloadPDFAction,
    handleDownloadPDF,
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
