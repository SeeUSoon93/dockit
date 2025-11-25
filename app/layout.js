import ClientLayout from "./ClientLayout";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: "no",
};

export const metadata = {
  metadataBase: new URL("https://dockit.kr"),
  title: "Dockit | 온라인 문서 작성 도구",
  description: "쓰는 것에만 집중하세요. 가장 심플한 온라인 문서, 독킷.",
  keywords:
    "Dockit, 온라인 문서 작성 도구, 심플한 문서, 독킷, 문서, 글 작성, 문서 작성, 작성, 독스, 구글 독스, ",
  icons: {
    icon: "/logo/symbol.png",
  },
  openGraph: {
    title: "DocKit | 온라인 문서 작성 도구",
    description: "쓰는 것에만 집중하세요. 가장 심플한 온라인 문서, 독킷.",
    type: "website",
    locale: "ko_KR",
    siteName: "DocKit | 온라인 문서 작성 도구",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dockit | 온라인 문서 작성 도구",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dockit | 온라인 문서 작성 도구",
    description: "쓰는 것에만 집중하세요. 가장 심플한 온라인 문서, 독킷.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://dockit.kr",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* mint-6 */}
        <meta name="theme-color" content="#e6fff9" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ClientLayout>
          {children}
          <Analytics />
        </ClientLayout>
      </body>
    </html>
  );
}
