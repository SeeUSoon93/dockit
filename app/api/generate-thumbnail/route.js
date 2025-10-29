import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function POST(request) {
  try {
    const { html, settings } = await request.json();

    // 기본 설정값
    const pageWidth = settings?.pageWidth || 210;
    const pageHeight = settings?.pageHeight || 297;
    const paddingTop = settings?.paddingTop || 25.4;
    const paddingBottom = settings?.paddingBottom || 25.4;
    const paddingLeft = settings?.paddingLeft || 25.4;
    const paddingRight = settings?.paddingRight || 25.4;

    // 800px 기준으로 변환 비율 계산
    const widthRatio = 800 / pageWidth;
    const renderWidth = 800;
    const renderHeight = Math.round(pageHeight * widthRatio);

    // 패딩을 px로 변환
    const paddingTopPx = paddingTop * widthRatio;
    const paddingBottomPx = paddingBottom * widthRatio;
    const paddingLeftPx = paddingLeft * widthRatio;
    const paddingRightPx = paddingRight * widthRatio;

    // 완전한 HTML 문서 생성
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: ${paddingTopPx}px ${paddingRightPx}px ${paddingBottomPx}px ${paddingLeftPx}px;
              width: ${renderWidth}px;
              height: ${renderHeight}px;
              font-family: Arial, sans-serif;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: chromium.headless,
    });

    const page = await broawser.newPage();

    await page.setViewport({
      width: renderWidth,
      height: renderHeight,
      deviceScaleFactor: 1,
    });

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    // 스크린샷 생성 (base64로)
    const screenshot = await page.screenshot({
      type: "png",
      encoding: "base64",
      clip: {
        x: 0,
        y: 0,
        width: renderWidth,
        height: renderHeight,
      },
    });

    await browser.close();

    return new Response(
      JSON.stringify({
        thumbnail: `data:image/png;base64,${screenshot}`,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("썸네일 생성 오류:", error);
    return new Response(JSON.stringify({ error: "썸네일 생성 실패" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
