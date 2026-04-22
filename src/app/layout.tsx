import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

/**
 * Fraunces — variable serif с широким диапазоном экспрессии.
 * Используем ТОЛЬКО для display/hero-заголовков на landing.
 */
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "Mindful Money — Спокойно о ваших деньгах",
  description:
    "Wellness-first платформа учёта личных финансов. Мягкие инсайты, красивые графики, никакого давления.",
  applicationName: "Mindful Money",
  authors: [{ name: "Mindful Money Team" }],
  keywords: [
    "личные финансы",
    "бюджет",
    "учёт расходов",
    "wellness",
    "financial wellness",
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFE" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0E1A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${fraunces.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mm-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
