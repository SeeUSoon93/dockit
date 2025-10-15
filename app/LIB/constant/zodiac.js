// /lib/zodiac.js
// === 상수 ===
export const Z = [
  "rat",
  "ox",
  "tiger",
  "rabbit",
  "dragon",
  "snake",
  "horse",
  "goat",
  "monkey",
  "rooster",
  "dog",
  "pig"
]; // 子丑寅卯辰巳午未申酉戌亥
const ZI = (key) => Z.indexOf(key);

// 합(六合)·충(六冲)·형(三刑/互刑/自刑)·해(六害) 매핑
const LIUHE = new Set([
  "rat-ox",
  "tiger-pig",
  "rabbit-dog",
  "dragon-rooster",
  "snake-monkey",
  "horse-goat"
]);
const CHONG = new Set([
  "rat-horse",
  "ox-goat",
  "tiger-monkey",
  "rabbit-rooster",
  "dragon-dog",
  "snake-pig"
]);
const XING = new Set([
  "rat-rabbit", // 互刑
  "tiger-snake",
  "tiger-monkey",
  "snake-monkey", // 三刑(寅巳申)
  "ox-goat",
  "ox-dog",
  "goat-dog", // 三刑(丑戌未)
  "dragon-dragon",
  "horse-horse",
  "rooster-rooster",
  "pig-pig" // 自刑
]);
const HAI = new Set([
  "rat-goat",
  "ox-horse",
  "tiger-snake",
  "rabbit-dragon",
  "monkey-pig",
  "rooster-dog"
]);

// === 유틸 ===
// 두 띠 key를 정렬해 'a-b'로
const pkey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

// 관계 판정 (우선순위: 충 > 형 > 해 > 합 > 무관)
export function relation(a, b) {
  if (a === b && ["dragon", "horse", "rooster", "pig"].includes(a))
    return "xing";
  const k = pkey(a, b);
  if (CHONG.has(k)) return "chong";
  if (XING.has(k)) return "xing";
  if (HAI.has(k)) return "hai";
  if (LIUHE.has(k)) return "he";
  return "none";
}

// 앵커: 2025-08-13은 'tiger(寅)' 일띠
const ANCHOR_DATE = "2025-08-13";
const ANCHOR_BRANCH = "tiger";

// 날짜 차이(일수, UTC기준 정수일)
const dayDiff = (d1, d0) => {
  const a = new Date(d1 + "T00:00:00Z").getTime();
  const b = new Date(d0 + "T00:00:00Z").getTime();
  return Math.round((a - b) / 86400000);
};

// 오늘(또는 특정) 날짜의 **일 띠** 구하기
export function dayZodiac(dateStr) {
  const diff = ((dayDiff(dateStr, ANCHOR_DATE) % 12) + 12) % 12;
  const base = ZI(ANCHOR_BRANCH);
  return Z[(base + diff) % 12];
}

// 같은 띠의 연생그룹(12년 간격) N개 (예: 닭띠 → 2005,1993,1981…)
export function cohortsForSign(
  sign,
  count = 8,
  refYear = new Date().getFullYear()
) {
  // 기준: 2020년=쥐띠(관용) → (year-2020)%12 로 띠 계산
  const signIdx = ZI(sign);
  let y = refYear;
  // refYear 이하에서 해당 띠가 나올 때까지 내림
  while ((((y - 2020) % 12) + 12) % 12 !== signIdx) y--;
  const ys = [];
  for (let i = 0; i < count; i++) ys.push(y - 12 * i);
  return ys;
}

// 결정론 난수 (mulberry32)
function rng(seed) {
  let t = [...seed].reduce((a, c) => (a + c.charCodeAt(0)) | 0, 0) || 1;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// 점수 생성 (0~100), 관계별 가중
function scored(seedKey, rel) {
  const r = rng(seedKey);
  const base = 50 + Math.floor(r() * 21) - 10; // 40~60
  const bump = { he: +12, none: +0, hai: -6, xing: -10, chong: -15 }[rel] ?? 0;
  const clip = (n) => Math.max(0, Math.min(100, n));
  const overall = clip(base + bump + Math.floor(r() * 11) - 5); // ±5 변동
  // 서브 스코어 4종
  const money = clip(overall + Math.floor(r() * 9) - 4);
  const love = clip(overall + Math.floor(r() * 9) - 4);
  const health = clip(overall + Math.floor(r() * 9) - 4);
  const work = clip(overall + Math.floor(r() * 9) - 4);
  return { overall, money, love, health, work };
}

// 테마/톤 힌트 (AI 문구 제어용)
function hints(seedKey) {
  const opts = [
    "차분",
    "실용",
    "유머",
    "격려",
    "주의",
    "정리",
    "도전",
    "협업",
    "인내",
    "기회"
  ];
  const r = rng(seedKey);
  const a = opts[Math.floor(r() * opts.length)];
  const b = opts[Math.floor(r() * opts.length)];
  return Array.from(new Set([a, b])).slice(0, 2);
}

// === 메인: 날짜 입력 → 12띠 + 각 띠 연생그룹 페이로드 생성 ===
export function buildDailyZodiacPayload(dateStr, cohortCount = 8) {
  const daySign = dayZodiac(dateStr); // 오늘 일띠
  const res = {
    date: dateStr,
    daySign,
    signs: {},
    meta: { seedVersion: 1, locale: "ko-KR" }
  };

  Z.forEach((sign) => {
    const rel = relation(sign, daySign);
    const key = `${dateStr}:${sign}`;
    res.signs[sign] = {
      summary: {
        relation: rel,
        scores: scored(key, rel),
        toneHints: hints(key),
        // 여기서 text는 비워두고, 클라에서 이 payload로 AI 호출해서 문구 생성
        text: null
      },
      cohorts: cohortsForSign(sign, cohortCount).map((year, i) => {
        const cKey = `${dateStr}:${sign}:${year}:${i}`;
        return {
          year,
          relation: rel, // 기준은 동일: 전부 오늘의 "일띠"와 비교
          scores: scored(cKey, rel),
          text: null
        };
      })
    };
  });
  return res;
}

export const zodiacList = [
  { name: "쥐", icon: "🐭", key: "rat" },
  { name: "소", icon: "🐮", key: "ox" },
  { name: "호랑이", icon: "🐯", key: "tiger" },
  { name: "토끼", icon: "🐰", key: "rabbit" },
  { name: "용", icon: "🐲", key: "dragon" },
  { name: "뱀", icon: "🐍", key: "snake" },
  { name: "말", icon: "🐴", key: "horse" },
  { name: "양", icon: "🐑", key: "goat" },
  { name: "원숭이", icon: "🐵", key: "monkey" },
  { name: "닭", icon: "🐔", key: "rooster" },
  { name: "개", icon: "🐶", key: "dog" },
  { name: "돼지", icon: "🐷", key: "pig" }
];
