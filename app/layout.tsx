import '@mantine/core/styles.css';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';
import ProviderLayout from "./components/layouts/ProviderLayouts";
import ServiceWorkerLayout from "./components/layouts/serviceWorker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const pixel = localFont({
  src: '../public/fonts/PixelGame.otf',
  display: "swap",
  variable: "--font-pixel"
});

export const metadata: Metadata = {
  title: "내 술들로 만드는 칵테일",
  description: "내가 보유한 술들로 만들 수 있는 칵테일 리스트 만들어주는 사이트입니다.",
  openGraph: {
    title: "내 술들로 만드는 칵테일",
    description: "내가 보유한 술들로 만들 수 있는 칵테일 리스트 만들어주는 사이트입니다.",
    type: "website",
    // url: "https://your-site-url.com",
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
    <html lang="en">
      <head>
        {/* Favicon 설정 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.webp" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${pixel.variable}`}
      >
        <ServiceWorkerLayout>
          <ProviderLayout>
            {children}
          </ProviderLayout>
        </ServiceWorkerLayout>
      </body>
    </html>
  );
}
