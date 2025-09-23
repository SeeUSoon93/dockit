// app/api/generate-pdf/route.js

import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // 1. 클라이언트로부터 HTML과 문서 설정(settings)을 받습니다.
    const { html, settings } = await request.json();

    // 2. Puppeteer 브라우저를 실행합니다.
    // Vercel 환경 등에서는 sandbox 옵션이 필요합니다.
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.emulateMediaType("screen");
    // 3. 받은 HTML을 페이지의 콘텐츠로 설정합니다.
    // networkidle0 옵션은 모든 네트워크 연결이 500ms 이상 없을 때까지 기다립니다.
    // (이미지 로딩 등을 기다리기 위함)
    await page.setContent(html, { waitUntil: "networkidle0" });

    // 4. page.pdf()를 호출하여 PDF를 Buffer 형태로 생성합니다.
    const pdfBuffer = await page.pdf({
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
        right: `${settings?.paddingRight || 25.4}mm`
      }
    });

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
        "Content-Disposition": "attachment; filename=document.pdf"
      }
    });
  } catch (error) {
    console.error("PDF 생성 오류:", error);
    // 에러 발생 시 500 상태 코드와 에러 메시지를 JSON으로 반환
    return NextResponse.json(
      { error: "PDF 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
