import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chess for Beginners',
  description: 'Learn chess with an interactive, kid-friendly chess game!',
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