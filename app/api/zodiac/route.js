import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

export async function POST(req) {
  try {
    const todayZodiac = await req.json();

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `너는 전문 띠 별 운세 해석가다. 
아래 JSON에 담긴 띠 별 운세 정보를 바탕으로 "오늘의 띠 별 운세"를 작성하라.

출력 형식은 반드시 JSON이며, 다른 설명이나 마크다운은 절대 포함하지 않는다.
출력 스키마(키 구조 고정):
{
  "date": "YYYY-MM-DD",
  "daySign": "string",
  "signs": {
    "rat": {
      "summary": { "text": "string" },
      "cohorts": [
        { "year": number, "text": "string" }
      ]
    },
    "ox": {
      "summary": { "text": "string" },
      "cohorts": [
        { "year": number, "text": "string" }
      ]
    },
    "tiger": { ... },
    "rabbit": { ... },
    "dragon": { ... },
    "snake": { ... },
    "horse": { ... },
    "goat": { ... },
    "monkey": { ... },
    "rooster": { ... },
    "dog": { ... },
    "pig": { ... }
  }
}

필수 규칙:
- 주어진 JSON 구조에서 date, daySign, year 값은 절대 변경하지 않는다.
- 제공된 데이터만 사용하고, 추측으로 사실을 생성하지 말 것.
- 각 summary.text는 4~5문장으로 해당 띠의 오늘의 총운을 작성한다.
- 각 cohorts[].text는 1~2문장으로 해당 연도에 태어난 사람의 운세를 작성한다.
- 제공된 relation, scores, toneHints, keywords를 기반으로 긍정적이거나 주의가 필요한 내용을 적절히 반영한다.
- JSON 외 다른 텍스트는 절대 포함하지 않는다. 출력문의 앞 뒤에 따옴표를 붙이지 않는다.
- 모든 필드는 반드시 채워야 하며, 빈 값은 허용하지 않는다. 모든 필드를 한글로 작성한다.
- 모든 띠의 오늘의 운세를 다 작성해야한다.
- JSON 구조는 반드시 고정되어야 하며, 추가 필드는 허용하지 않는다.
`,
        },
        {
          role: "user",
          content: JSON.stringify(todayZodiac),
        },
      ],
    });

    return new Response(
      JSON.stringify({ result: completion.choices[0].message.content }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
