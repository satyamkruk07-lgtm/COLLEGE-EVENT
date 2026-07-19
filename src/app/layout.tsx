import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evora - Next-gen Event Management",
  description: "Seamlessly register, manage, and track international tech events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col relative overflow-x-hidden transition-colors duration-300">
        <SmoothScroll>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange={true}
          >
            {/* The Dynamic Navigation Bar */}
            <Navbar />
            
            <main className="flex-1 w-full">
              {children}
            </main>
            
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}



