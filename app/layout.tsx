import '@mantine/core/styles.css';
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import localFont from 'next/font/local';
import ProviderLayout from "./components/layouts/ProviderLayouts";
import ServiceWorkerLayout from "./components/layouts/serviceWorker";
import "./globals.css";

const pixel = localFont({
  src: '../public/fonts/PixelGame.otf',
  display: "swap",
  variable: "--font-pixel"
});

const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://my-alcohol-cocktail.vercel.app";

export const metadata: Metadata = {
  title: "내 술들로 만드는 칵테일",
  description: "내가 보유한 술들로 만들 수 있는 칵테일 리스트 만들어주는 사이트입니다.",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "내 술들로 만드는 칵테일",
    description: "내가 보유한 술들로 만들 수 있는 칵테일 리스트 만들어주는 사이트입니다.",
    type: "website",
    url: appUrl,
    images: [
      {
        url: "/icon.webp",
        width: 512,
        height: 512,
        alt: "내 술들로 만드는 칵테일",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "내 술들로 만드는 칵테일",
    description: "내가 보유한 술들로 만들 수 있는 칵테일 리스트 만들어주는 사이트입니다.",
    images: [
      {
        url: "/icon.webp",
        alt: "내 술들로 만드는 칵테일",
      },
    ],
  },
  icons: {
    icon: "/icon.webp",
    apple: "/icon.webp",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.webp" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href='/manifest.json' />
      </head>
      <body
        className={`antialiased ${pixel.variable}`}
      >
        <ServiceWorkerLayout>
          <ProviderLayout>
            {children}
            <SpeedInsights />
          </ProviderLayout>
        </ServiceWorkerLayout>
      </body>
    </html>
  );
}
