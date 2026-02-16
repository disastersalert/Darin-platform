import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DARIN - Disaster and Risk Information Network',
  description: 'Global disaster monitoring and intelligence platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
