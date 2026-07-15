import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BNC Basketball League',
  description: 'BNC Basketball League Official Website',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/uploads/favicon.png?v=20260715', type: 'image/png' },
    ],
    apple: '/uploads/favicon.png?v=20260715',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans antialiased bg-white text-gray-800`}
      >
        {children}
      </body>
    </html>
  );
}
