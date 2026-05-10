import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Academia.io',
  description: 'Academia.io: The New Layer of Digital Education',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}