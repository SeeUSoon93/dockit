import ClientLayout from "./ClientLayout";
import "./globals.css";
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: "no"
};

export const metadata = {
  title: "DocKit",
  icons: {
    icon: "/logo/logo.svg"
  },
  openGraph: {
    title: "DocKit",
    type: "website",
    locale: "ko_KR",
    siteName: "DocKit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DocKit"
      }
    ]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* mint-6 */}
        <meta name="theme-color" content="#13c2c2" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
