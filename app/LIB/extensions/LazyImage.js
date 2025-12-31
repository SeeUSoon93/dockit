import Image from "@tiptap/extension-image";
import { Plugin } from "@tiptap/pm/state";

export const LazyImage = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      {
        ...HTMLAttributes,
        loading: "lazy",
        decoding: "async",
        // 이미지 최적화를 위한 추가 속성
        fetchpriority: "auto",
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        view(editorView) {
          let imageObserver = null;

          const initLazyImages = () => {
            // 기존 observer가 있으면 정리
            if (imageObserver) {
              imageObserver.disconnect();
            }

            // 아직 초기화되지 않은 이미지만 선택
            const images = editorView.dom.querySelectorAll(
              "img:not([data-lazy-init])"
            );

            if (images.length === 0) return;

            imageObserver = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    const img = entry.target;
                    // 이미 로드된 이미지는 스킵
                    if (img.complete) {
                      img.setAttribute("data-lazy-init", "true");
                      imageObserver.unobserve(img);
                      return;
                    }
                    // 이미지가 뷰포트에 들어오면 로드 시작
                    img.setAttribute("data-lazy-init", "true");
                  }
                });
              },
              {
                rootMargin: "200px", // 뷰포트 밖 200px 전에 미리 로드
                threshold: 0.01,
              }
            );

            images.forEach((img) => {
              // 이미 로드된 이미지는 observer에 추가하지 않음
              if (!img.complete) {
                imageObserver.observe(img);
              } else {
                img.setAttribute("data-lazy-init", "true");
              }
            });
          };

          // 초기화
          setTimeout(initLazyImages, 100);

          // MutationObserver로 DOM 변경 감지
          const mutationObserver = new MutationObserver(() => {
            setTimeout(initLazyImages, 0);
          });

          mutationObserver.observe(editorView.dom, {
            childList: true,
            subtree: true,
          });

          return {
            destroy() {
              if (imageObserver) {
                imageObserver.disconnect();
              }
              mutationObserver.disconnect();
            },
          };
        },
      }),
    ];
  },
});
