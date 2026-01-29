import './globals.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MyQuotes | Personal Manager',
  description: 'Manage your favorite quotes and notes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
