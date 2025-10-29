// app/api/generate-pdf/route.js

// 1. (수정) puppeteer-core 와 @sparticuz/chromium 를 임포트
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { NextResponse } from "next/server";

export async function POST(request) {
  let browser = null; // 2. (추가) finally에서 닫을 수 있게 browser 변수 선언

  try {
    // --- (순이님 코드 100% 동일) ---
    const { html, settings } = await request.json();
    // --- (순이님 코드 끝) ---

    // 3. (수정) Vercel에서 실행되도록 launch 옵션 변경
    browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: chromium.headless,
    });

    // --- (순이님 코드 100% 동일) ---
    const page = await browser.newPage();
    await page.emulateMediaType("screen");

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      width: `${settings?.pageWidth || 210}mm`,
      height: `${settings?.pageHeight || 297}mm`,
      printBackground: true,
      margin: {
        top: `${settings?.paddingTop || 25.4}mm`,
        bottom: `${settings?.paddingBottom || 25.4}mm`,
        left: `${settings?.paddingLeft || 25.4}mm`,
        right: `${settings?.paddingRight || 25.4}mm`,
      },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=document.pdf",
      },
    });
    // --- (순이님 코드 끝) ---
  } catch (error) {
    // 4. (추가) 오류 발생 시에도 브라우저를 닫도록 보장
    if (browser) {
      await browser.close();
    }

    console.error("PDF 생성 오류:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: "PDF 생성에 실패했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
