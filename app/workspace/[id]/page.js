"use client";

import { useDocument } from "@/app/LIB/context/DocumentContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { Div, DotSpinner, toast } from "sud-ui";
import ContentEditor from "@/app/LIB/components/Write/ContentEditor";
import { useDebounce } from "@/app/LIB/utils/useDebounce";
import { useEditorContext } from "@/app/LIB/context/EditorContext";

import { useSetting } from "@/app/LIB/context/SettingContext";

export default function WritePage() {
  const { document, saveDocument, loading } = useDocument();
  const { editor, setEditor, setSaveAction, setDownloadPDFAction } =
    useEditorContext();

  const { setting } = useSetting();

  const [content, setContent] = useState(null);
  const debouncedContent = useDebounce(content, setting.autoSaveDelay);

  const editorRef = useRef(null);

  // 자동 저장
  useEffect(() => {
    if (!setting.autoSave) return;
    if (
      !loading &&
      debouncedContent !== null &&
      document?.content !== undefined
    ) {
      // HTML 문자열을 직접 비교하여 변경되었을 때만 저장
      if (debouncedContent !== document.content) {
        saveDocument(document._id, { content: debouncedContent });
      }
    }
  }, [debouncedContent, document, saveDocument, loading, setting.autoSave]);

  // 문서 로딩 로직
  useEffect(() => {
    if (document?.content) {
      setContent(document.content);
    } else if (document) {
      setContent("");
    }
  }, [document]);

  const handleSave = useCallback(() => {
    // 즉시 저장 로직
    if (document && content !== null) {
      saveDocument(document._id, { content: content });
      toast.success("저장되었습니다!");
    }
  }, [document, content, saveDocument]);

  useEffect(() => {
    setSaveAction(() => handleSave);
    // setDownloadPDFAction(() => handleDownloadPDF);

    return () => {
      setSaveAction(null);
      setDownloadPDFAction(null);
    };
  }, [handleSave, setSaveAction, setDownloadPDFAction]);

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
              bulletStyle={document?.bulletStyle}
            />
          </Div>
        </div>
      )}
    </div>
  );
}
