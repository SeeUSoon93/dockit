"use client";

import { Div, DotSpinner } from "sud-ui";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/LIB/config/config";
import { generateCssVariables } from "@/app/LIB/utils/tiptapUtils";

export default function SharePage() {
  const params = useParams();
  const [document, setDocument] = useState(null);
  const [docSetting, setDocSetting] = useState(null);
  const [bulletStyle, setBulletStyle] = useState(null);
  const [content, setContent] = useState(null);
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
          console.log(htmlContent);
          setContent(htmlContent);
        } else if (doc.content) {
          setContent(doc.content);
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

  // bulletStyle CSS 변수 생성
  const editorStyleVariables = generateCssVariables(bulletStyle);

  // docSetting CSS 적용
  useEffect(() => {
    if (!docSetting) return;

    const pageStyle = `
      @media print {
        @page {
          size: ${docSetting.pageWidth}mm ${docSetting.pageHeight}mm;
          margin: ${docSetting.paddingTop}mm ${docSetting.paddingRight}mm ${docSetting.paddingBottom}mm ${docSetting.paddingLeft}mm;
        }
      }
    `;

    let styleTag = window.document.getElementById("dynamic-page-style");
    if (!styleTag) {
      styleTag = window.document.createElement("style");
      styleTag.id = "dynamic-page-style";
      window.document.head.appendChild(styleTag);
    }

    styleTag.textContent = pageStyle;

    return () => {
      styleTag?.remove();
    };
  }, [docSetting]);

  const divStyle = () => {
    if (!docSetting) return {};

    const workspaceWidth = 800;
    const widthRatio = workspaceWidth / docSetting.pageWidth;
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
      width: `${workspaceWidth}px`,
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
            className={`shadow-sm tiptap-container prose prose-sm sm:prose-base`}
            id="paper-wrapper"
            style={{ ...divStyle(), ...editorStyleVariables }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      )}
    </Div>
  );
}
