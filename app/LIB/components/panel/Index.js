import WidgetCard from "./WidgetCard";
import { PiListNumbersFill } from "react-icons/pi";
import { Card, Typography } from "sud-ui";
import { useDocument } from "../../context/DocumentContext";
import { useMemo } from "react";

// ContentEditor.js의 counterStyleMap과 동일하게 정의
const counterStyleMap = {
  decimal: "decimal",
  "upper-roman": "upper-roman",
  "lower-roman": "lower-roman",
  "upper-alpha": "upper-alpha",
  "lower-alpha": "lower-alpha",
  korean: "hangul-consonant", // "ㄱ" -> CSS 'hangul-consonant'
  "korean-2": "hangul" // "가" -> CSS 'hangul'
};

// 각 스타일에 따른 번호 생성 함수
const formatNumber = (num, style) => {
  switch (style) {
    case "decimal":
      return num.toString();
    case "upper-roman":
      return toRoman(num).toUpperCase();
    case "lower-roman":
      return toRoman(num).toLowerCase();
    case "upper-alpha":
      return String.fromCharCode(64 + num); // A, B, C...
    case "lower-alpha":
      return String.fromCharCode(96 + num); // a, b, c...
    case "hangul-consonant":
      // ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅅ, ㅇ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ
      const consonants = [
        "ㄱ",
        "ㄴ",
        "ㄷ",
        "ㄹ",
        "ㅁ",
        "ㅂ",
        "ㅅ",
        "ㅇ",
        "ㅈ",
        "ㅊ",
        "ㅋ",
        "ㅌ",
        "ㅍ",
        "ㅎ"
      ];
      return consonants[(num - 1) % consonants.length];
    case "hangul":
      // 가, 나, 다, 라, 마, 바, 사, 아, 자, 차, 카, 타, 파, 하
      const syllables = [
        "가",
        "나",
        "다",
        "라",
        "마",
        "바",
        "사",
        "아",
        "자",
        "차",
        "카",
        "타",
        "파",
        "하"
      ];
      return syllables[(num - 1) % syllables.length];
    default:
      return num.toString();
  }
};

// 로마 숫자 변환 함수
const toRoman = (num) => {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = [
    "M",
    "CM",
    "D",
    "CD",
    "C",
    "XC",
    "L",
    "XL",
    "X",
    "IX",
    "V",
    "IV",
    "I"
  ];
  let result = "";

  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }
  return result;
};

export default function Index({ dragHandleProps }) {
  const { content, bulletStyle } = useDocument();

  const headings = useMemo(() => {
    if (!content) return [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const nodes = Array.from(doc.querySelectorAll("h1, h2, h3"));

      const counters = { h1: 0, h2: 0, h3: 0 };
      const h1Number = { current: "" };
      const h2Number = { current: "" };

      return nodes.map((node) => {
        const level = parseInt(node.tagName.replace("H", ""), 10);
        const levelKey = `h${level}`;

        // 현재 레벨 카운터 증가
        counters[levelKey]++;

        // 하위 레벨 카운터 초기화
        if (level === 1) {
          counters.h2 = 0;
          counters.h3 = 0;
        } else if (level === 2) {
          counters.h3 = 0;
        }

        // bulletStyle에서 해당 레벨의 스타일 가져오기
        const styleKey = bulletStyle?.[levelKey];
        const cssStyle = counterStyleMap[styleKey] || "decimal";

        // 계층적 번호 생성
        let number = "";

        if (level === 1) {
          // h1: 단순 번호
          number = formatNumber(counters.h1, cssStyle);
          h1Number.current = number;
        } else if (level === 2) {
          // h2: h1번호.h2번호
          const h2Formatted = formatNumber(counters.h2, cssStyle);
          number = `${h1Number.current}.${h2Formatted}`;
          h2Number.current = number;
        } else if (level === 3) {
          // h3: h1번호.h2번호.h3번호
          const h3Formatted = formatNumber(counters.h3, cssStyle);
          number = `${h2Number.current}.${h3Formatted}`;
        }

        return {
          level,
          number,
          text: node.textContent,
          id: node.id || `heading-${level}-${counters[levelKey]}`
        };
      });
    } catch (err) {
      console.error("목차 파싱 실패:", err);
      return [];
    }
  }, [content, bulletStyle]);

  return (
    <WidgetCard
      icon={PiListNumbersFill}
      title="목차"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        {headings.length === 0 ? (
          <div className="flex justify-center">
            <Typography color={"cool-gray-7"}>목차가 없습니다</Typography>
          </div>
        ) : (
          <Card shadow="none" width="100%">
            <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
              {headings.map((h, i) => (
                <li
                  key={i}
                  style={{
                    marginLeft: (h.level - 1) * 10,
                    marginBottom: "4px",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    // 여러 방법으로 요소 찾기 시도
                    let el = window.document.getElementById(h.id);
                    if (!el) {
                      const headings =
                        window.document.querySelectorAll("h1, h2, h3");
                      el = Array.from(headings).find(
                        (heading) =>
                          heading.textContent.trim() === h.text.trim()
                      );
                    }
                    if (el) {
                      setTimeout(() => {
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                          inline: "nearest"
                        });
                      }, 20);
                    } else {
                      console.warn("요소를 찾을 수 없습니다:", h.id);
                    }
                  }}
                >
                  <span style={{ marginRight: "4px" }}>{h.number}.</span>
                  {h.text}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </WidgetCard>
  );
}
