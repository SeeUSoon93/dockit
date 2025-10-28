// app/api/generate-pdf/route.js

import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

// Vercel 환경에서 사용할 chromium 경로 설정
const isVercel = process.env.VERCEL === "1";
const chromiumPath = isVercel
  ? "/opt/render/project/.chromium/chrome-linux/chrome"
  : undefined;

export async function POST(request) {
  try {
    // 1. 클라이언트로부터 HTML과 문서 설정(settings)을 받습니다.
    const { html, settings } = await request.json();

    console.log("PDF 생성 요청 시작:", {
      htmlLength: html?.length,
      settings: settings,
      timestamp: new Date().toISOString(),
    });

    // 2. Puppeteer 브라우저를 실행합니다.
    // Vercel 환경 등에서는 sandbox 옵션이 필요합니다.
    const launchOptions = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    };

    // Vercel 환경에서 chromium 경로 설정
    if (chromiumPath) {
      launchOptions.executablePath = chromiumPath;
    }

    console.log("Puppeteer 실행 옵션:", launchOptions);

    const browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // 페이지 타임아웃 설정 (30초)
    page.setDefaultTimeout(30000);

    await page.emulateMediaType("screen");

    console.log("페이지 설정 완료, HTML 콘텐츠 로딩 시작");

    // 3. 받은 HTML을 페이지의 콘텐츠로 설정합니다.
    // networkidle0 옵션은 모든 네트워크 연결이 500ms 이상 없을 때까지 기다립니다.
    // (이미지 로딩 등을 기다리기 위함)
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    console.log("HTML 콘텐츠 로딩 완료, PDF 생성 시작");

    // 4. page.pdf()를 호출하여 PDF를 Buffer 형태로 생성합니다.
    const pdfOptions = {
      // 용지 크기 설정 (A4 기본값)
      width: `${settings?.pageWidth || 210}mm`,
      height: `${settings?.pageHeight || 297}mm`,
      // 배경 그래픽(색상, 이미지 등)도 인쇄에 포함시킵니다.
      printBackground: true,
      // PDF 여백 설정
      margin: {
        top: `${settings?.paddingTop || 25.4}mm`,
        bottom: `${settings?.paddingBottom || 25.4}mm`,
        left: `${settings?.paddingLeft || 25.4}mm`,
        right: `${settings?.paddingRight || 25.4}mm`,
      },
      // 배포 환경에서 안정성을 위한 추가 옵션
      preferCSSPageSize: false,
      displayHeaderFooter: false,
    };

    console.log("PDF 생성 옵션:", pdfOptions);

    const pdfBuffer = await page.pdf(pdfOptions);

    console.log("PDF 생성 완료, 크기:", pdfBuffer.length, "bytes");

    // 5. 브라우저를 닫습니다.
    await browser.close();

    // 6. 생성된 PDF Buffer를 클라이언트에 응답으로 보냅니다.
    // NextResponse를 사용하여 헤더를 설정합니다.
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        // 브라우저가 응답을 PDF 파일로 인식하도록 설정
        "Content-Type": "application/pdf",
        // 다운로드될 파일의 이름을 지정
        "Content-Disposition": "attachment; filename=document.pdf",
      },
    });
  } catch (error) {
    console.error("PDF 생성 오류:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
    });

    // 브라우저가 열려있다면 닫기
    try {
      if (typeof browser !== "undefined" && browser) {
        await browser.close();
      }
    } catch (closeError) {
      console.error("브라우저 닫기 오류:", closeError);
    }

    // 에러 발생 시 500 상태 코드와 에러 메시지를 JSON으로 반환
    return NextResponse.json(
      {
        error: "PDF 생성에 실패했습니다.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
