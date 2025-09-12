// TipTap JSON을 페이지 나누기('horizontalRule') 기준으로 잘라주는 함수
export const splitContentByPageBreak = (docJSON) => {
  if (!docJSON || !docJSON.content) return [{ type: "doc", content: [] }];

  const pages = [];
  let currentPageContent = [];

  docJSON.content.forEach((node) => {
    if (node.type === "horizontalRule") {
      pages.push({ type: "doc", content: currentPageContent });
      currentPageContent = [];
    } else {
      currentPageContent.push(node);
    }
  });

  pages.push({ type: "doc", content: currentPageContent });

  return pages;
};

// 페이지별로 나뉜 JSON 배열을 다시 하나의 문서로 합치는 함수
export const joinContentPages = (pages) => {
  const combinedContent = pages.flatMap((page, index) => {
    if (!page.content) return [];
    if (index > 0) {
      return [{ type: "horizontalRule" }, ...page.content];
    }
    return page.content;
  });

  return { type: "doc", content: combinedContent };
};
