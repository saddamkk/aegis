import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider, themeInitScript } from '@/theme/ThemeProvider';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AEGIS Design System',
  description: 'Design tokens and component library for AEGIS — Grounded Email Assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-canvas text-text-1">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
