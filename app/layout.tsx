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
      { url: '/uploads/favicon-bnc.png', type: 'image/png', sizes: '32x32' },
      { url: '/uploads/favicon-bnc.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/uploads/favicon-bnc.png',
    apple: '/uploads/favicon-bnc.png',
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
