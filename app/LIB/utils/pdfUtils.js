import { generateCssVariables } from "./tiptapUtils";

// 외부 CSS 파일 내용을 가져와 <style> 태그로 바꿔주는 헬퍼 함수
const inlineCssStyles = async (htmlString) => {
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
};

export const generateStyleSet = async (
  bulletStyle,
  docSetting,
  content,
  idReadonly = false
) => {
  const editorStyleVariables = generateCssVariables(bulletStyle);
  const variableStyleString = `
  :root {
    ${Object.entries(editorStyleVariables)
      .map(([key, value]) => `${key}: ${value};`)
      .join("\n  ")}
  }
      @page {
        /* 3a. 모든 페이지에 기본 여백 설정 */
        size: ${docSetting?.pageWidth || 210}mm ${
    docSetting?.pageHeight || 297
  }mm;
        margin-top: ${docSetting?.paddingTop || 25.4}mm;
        margin-bottom: ${docSetting?.paddingBottom || 25.4}mm;
        margin-left: ${docSetting?.paddingLeft || 25.4}mm;
        margin-right: ${docSetting?.paddingRight || 25.4}mm;
      }
      
      /* 3b. (핵심!) 첫 페이지만 상단 여백을 0으로 덮어쓰기 */
      ${
        idReadonly
          ? ""
          : `
      @page :first {
        margin-top: 0mm;
      }
      `
      }
      /* 빈 <p> 태그가 높이를 갖도록 강제 (줄바꿈 문제 해결) */
      .prose p:empty {
        min-height: 1rem; 
      }
      /* 3. (신규!) 페이지 나누기 규칙*/      
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
        break-after: avoid-page;
      }
      img, figure, blockquote, table, ul, ol {
        page-break-inside: avoid;
        break-inside: avoid-page;
      }
      p {
        widows: 2;
        orphans: 2;
      }      
  `;

  const styleTags = Array.from(
    window.document.querySelectorAll(
      'style:not(#dynamic-page-style), link[rel="stylesheet"]'
    )
  )
    .map((tag) => tag.outerHTML)
    .join("");

  const combinedHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <base href="https://dockit.kr/">
          ${styleTags}
          <style>
          ${variableStyleString}
        </style>
        </head>
        <body>
          <div class="tiptap-container prose ProseMirror printable-area">
            ${content}
          </div>
        </body>
      </html>
    `;

  const finalHtml = await inlineCssStyles(combinedHtml);

  return finalHtml;
};
