import type { Metadata } from 'next';
import { Poppins, Inter, Space_Grotesk } from 'next/font/google';
import { ErrorProviderWrapper, NavBar, ToastProvider } from '@/components/common';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Academia.io | Gamified learning for schools',
  description: 'A role-aware learning platform for students, teachers, administrators, and school leaders.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${poppins.variable} ${inter.variable} ${spaceGrotesk.variable} overflow-x-hidden bg-transparent text-slate-900 antialiased`}
        style={{
          fontFamily: 'var(--font-inter), sans-serif',
        }}
      >
        <ErrorProviderWrapper>
          <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(0,82,204,0.12),transparent_24%),radial-gradient(circle_at_85%_0%,rgba(255,77,148,0.08),transparent_22%),radial-gradient(circle_at_50%_90%,rgba(0,102,255,0.08),transparent_28%)]" />
          <ToastProvider>
            <NavBar />
            <main className="min-h-screen bg-transparent">
              {children}
            </main>
          </ToastProvider>
        </ErrorProviderWrapper>
      </body>
    </html>
  );
}