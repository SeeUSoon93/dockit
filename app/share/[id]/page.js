"use client";

import { Div, DotSpinner } from "sud-ui";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/LIB/config/config";
import { useLayout } from "@/app/LIB/context/LayoutContext";
import "katex/dist/katex.min.css";
import { generateStyleSet } from "@/app/LIB/utils/pdfUtils";

export default function SharePage() {
  const params = useParams();
  const { layoutMode } = useLayout();
  const [document, setDocument] = useState(null);
  const [docSetting, setDocSetting] = useState(null);
  const [bulletStyle, setBulletStyle] = useState(null);
  const [rawContent, setRawContent] = useState(null); // 원본 콘텐츠
  const [content, setContent] = useState(null); // 처리된 콘텐츠
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocument = async () => {
      setLoading(true);
      try {
        // 공개 API 엔드포인트로 문서 가져오기 (인증 불필요)
        const response = await fetch(`${API_BASE_URL}/share/${params.id}`);

        if (!response.ok) {
          throw new Error("문서를 불러올 수 없습니다.");
        }
        const data = await response.json();
        const doc = data.content;
        setDocument(doc);
        setDocSetting(
          doc.docSetting || {
            pageWidth: 210,
            pageHeight: 297,
            paddingTop: 25.4,
            paddingBottom: 25.4,
            paddingLeft: 25.4,
            paddingRight: 25.4,
          }
        );
        setBulletStyle(doc.bulletStyle || {});
        // contentURL에서 HTML 가져오기
        if (doc.contentURL) {
          const contentResponse = await fetch(doc.contentURL);
          const htmlContent = await contentResponse.text();
          setRawContent(htmlContent);
        } else if (doc.content) {
          setRawContent(doc.content);
        }
      } catch (error) {
        console.error("문서 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadDocument();
    }
  }, [params.id]);

  // 컨텐츠 생성 (원본 콘텐츠가 변경되거나 스타일 설정이 변경될 때만 실행)
  useEffect(() => {
    const generateContent = async () => {
      if (rawContent && bulletStyle !== null && docSetting) {
        const finalHtml = await generateStyleSet(
          bulletStyle,
          docSetting,
          rawContent,
          true
        );
        setContent(finalHtml);
      }
    };
    generateContent();
  }, [rawContent, bulletStyle, docSetting]);

  // docSetting CSS 적용
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
    if (!docSetting) return {};
    const currentVwInPx = window.innerWidth;
    const width = layoutMode === "mobile" ? currentVwInPx - 20 : 800;

    const widthRatio = width / docSetting.pageWidth;
    const paddingTop = docSetting.paddingTop * widthRatio;
    const paddingBottom = docSetting.paddingBottom * widthRatio;
    const paddingLeft = docSetting.paddingLeft * widthRatio;
    const paddingRight = docSetting.paddingRight * widthRatio;
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
  return (
    <Div className="flex flex-col items-center justify-center gap-10 pd-y-50">
      {loading || content === null ? (
        <DotSpinner />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Div
            background="white-10"
            id="paper-wrapper"
            className="shadow-sm relative w-full tiptap-container prose prose-sm sm:prose-base printable-area"
            style={{ ...divStyle() }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      )}
    </Div>
  );
}
