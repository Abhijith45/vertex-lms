import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogIdentity } from "@/components/analytics/posthog-identity";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

import { ThemeProvider } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: "Vertex — AI-Powered Learning Platform",
  description:
    "A modern learning platform with intelligent content search, video lessons, and structured courses.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider appearance={{ variables: { colorPrimary: "#E05A36" } }}>
      <html
        lang="en"
        className={`${playfair.variable} ${inter.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  var saved = localStorage.getItem('vertex-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (saved === 'system' && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              `,
            }}
          />
        </head>
        <body className="min-h-full flex flex-col bg-white dark:bg-[#090D16] text-neutral-900 dark:text-neutral-100 transition-colors duration-200" suppressHydrationWarning>
          <ThemeProvider>
            <PostHogIdentity />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
