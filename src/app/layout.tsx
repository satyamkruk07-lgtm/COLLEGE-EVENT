import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SmoothScroll } from "@/components/smooth-scroll";
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
            {/* The Navigation Bar - Minimalist Glass */}
            <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-black/20 backdrop-blur-lg border-b border-white/10 transition-colors duration-300">
              <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6 sm:px-10">
                
                {/* Left: Brand Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-lg uppercase tracking-widest text-white">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M4.8 5.6A9 9 0 0 0 4.8 18.4"/>
                    <path d="M19.2 5.6a9 9 0 0 1 0 12.8"/>
                  </svg>
                  Evora
                </Link>

                {/* Center: Navigation Links */}
                <div className="hidden lg:flex items-center gap-8 font-medium text-[0.75rem] uppercase tracking-widest text-white/80">
                  <Link href="/events" className="hover:text-white transition-colors">Events</Link>
                  <Link href="/features" className="hover:text-white transition-colors">Features</Link>
                  <Link href="/impact" className="hover:text-white transition-colors">Impact</Link>
                </div>

                {/* Right: Actionables */}
                <div className="flex items-center gap-4">
                  <Link href="/login" className="hidden sm:inline-flex bg-white text-black text-[0.75rem] font-semibold uppercase tracking-widest px-5 py-2.5 rounded-full transition-all shadow-sm hover:bg-cyan-400">
                    Access Portal
                  </Link>
                </div>

              </div>
            </nav>
            
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



